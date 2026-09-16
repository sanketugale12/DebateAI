import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Swords, 
  GraduationCap, 
  Compass, 
  Scale, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  MessageSquare,
  Flame,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Award
} from 'lucide-react';
import { 
  ChatConversation, 
  ChatMessage, 
  DebatePersona, 
  Position, 
  DebateResult,
  User 
} from '../types';
import { requestChatbotResponse, autoGenerateChatTitle } from '../services/chatEngine';
import { judgeDebateClient } from '../services/aiEngine';

interface ChatbotViewProps {
  user: User;
  conversations: ChatConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: (initialTopic?: string, persona?: DebatePersona) => void;
  onUpdateConversation: (updated: ChatConversation) => void;
  onAdjudicateToResults: (result: DebateResult) => void;
  onNavigateToArena?: () => void;
}

const OUT_OF_THE_BOX_QUESTIONS = [
  {
    category: 'Culinary Taxonomy',
    title: 'Is a hotdog a sandwich, or does the Cube Rule of Food make it a taco?',
    icon: '🌭',
    tag: 'Classic Clash',
    prompt: 'Is a hotdog a sandwich? Defend your answer using structural, legal, and linguistic taxonomy.'
  },
  {
    category: 'Astrophysics vs Biology',
    title: 'Who would win: 1 billion lions or the Sun?',
    icon: '🦁',
    tag: 'Cosmic Battle',
    prompt: 'Who would win: 1 billion lions or the Sun? Analyze the thermodynamics, mass, and gravitational mechanics.'
  },
  {
    category: 'Scientific Hypothetical',
    title: 'What if gravity suddenly stopped for 5 seconds everywhere on Earth?',
    icon: '🌌',
    tag: 'What If',
    prompt: 'What if gravity suddenly stopped for 5 seconds everywhere on Earth? What are the immediate physical and societal consequences?'
  },
  {
    category: 'Law & Superheroes',
    title: 'In a real-world court, should Batman be convicted of more crimes than Gotham villains?',
    icon: '🦇',
    tag: 'Jurisprudence',
    prompt: 'In a real-world court of law, should Batman be convicted of more civil rights and fourth amendment violations than the villains he catches?'
  },
  {
    category: 'Surface Chemistry',
    title: 'Is water wet, or does it only make other materials wet?',
    icon: '💧',
    tag: 'Paradox',
    prompt: 'Is water wet, or does it only make other substances wet? Settle this dialectical debate.'
  },
  {
    category: 'Philosophy of Mind',
    title: 'Are we living in a computer simulation, and can it ever be proven or falsified?',
    icon: '🌀',
    tag: 'Simulation Theory',
    prompt: 'Are we living in a computer simulation? Evaluate Nick Bostrom\'s simulation trilemma and its epistemological validity.'
  }
];

const STARTER_TOPICS = [
  {
    category: 'Technology & AI',
    title: 'AI models should be legally liable for generated copyright and privacy harms',
    stance: 'PRO' as Position,
    tag: 'Trending'
  },
  {
    category: 'Economics',
    title: 'Universal Basic Income is vital to counter automated workforce disruption',
    stance: 'PRO' as Position,
    tag: 'Policy'
  },
  {
    category: 'Energy & Climate',
    title: 'Nuclear power expansion is indispensable for achieving realistic net-zero emissions',
    stance: 'PRO' as Position,
    tag: 'Climate'
  },
  {
    category: 'Ethics & Society',
    title: 'Social media algorithmic feeds should be banned for users under eighteen',
    stance: 'PRO' as Position,
    tag: 'Ethics'
  }
];

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  user,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onUpdateConversation,
  onAdjudicateToResults,
  onNavigateToArena
}) => {
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [starterTab, setStarterTab] = useState<'out_of_the_box' | 'policy'>('out_of_the_box');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputVal]);

  // Speech-to-Text handler
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputVal(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text-to-Speech handler
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_>]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading || !activeConversation) return;

    setInputVal('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      topic: activeConversation.topic,
    };

    // Auto update title and topic if this is the first message or a default topic
    const isFirstMessage = activeConversation.messages.length === 0;
    const isDefaultTopic = !activeConversation.topic || 
      activeConversation.topic === 'Open Debate' || 
      activeConversation.topic === 'Open Debate & Inquiries' ||
      activeConversation.topic === 'Open Debate & Out-of-the-Box Inquiries' ||
      activeConversation.topic === 'General Debate';

    const newTitle = isFirstMessage || isDefaultTopic
      ? autoGenerateChatTitle(text, isDefaultTopic ? undefined : activeConversation.topic)
      : activeConversation.title;

    const newTopic = isFirstMessage || isDefaultTopic
      ? newTitle
      : activeConversation.topic;

    const updatedWithUser: ChatConversation = {
      ...activeConversation,
      title: newTitle,
      topic: newTopic,
      messages: [...activeConversation.messages, userMessage],
      updatedAt: new Date().toISOString(),
    };

    onUpdateConversation(updatedWithUser);

    setIsLoading(true);
    setLoadingText(
      activeConversation.persona === 'adversary'
        ? 'AI Opponent is formulating counterargument...'
        : activeConversation.persona === 'coach'
        ? 'Debate Coach is analyzing rhetorical warrants...'
        : activeConversation.persona === 'socratic'
        ? 'Socratic Inquirer is formulating dialectical questions...'
        : 'Referee is auditing clash and burden of proof...'
    );

    try {
      const response = await requestChatbotResponse(updatedWithUser, text);

      // Attach analysis to user message
      const finalizedMessages = updatedWithUser.messages.map(m => 
        m.id === userMessage.id 
          ? { ...m, analysis: response.analysis, fallacies: response.fallacies }
          : m
      );

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        persona: activeConversation.persona,
        topic: updatedWithUser.topic,
      };

      const finalUpdated: ChatConversation = {
        ...updatedWithUser,
        messages: [...finalizedMessages, aiMessage],
        updatedAt: new Date().toISOString(),
      };

      onUpdateConversation(finalUpdated);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Change Persona
  const handleSelectPersona = (persona: DebatePersona) => {
    if (!activeConversation) return;
    const updated: ChatConversation = {
      ...activeConversation,
      persona,
      updatedAt: new Date().toISOString()
    };
    onUpdateConversation(updated);
    setShowPersonaMenu(false);
  };

  // Toggle Stance
  const handleToggleStance = () => {
    if (!activeConversation) return;
    const nextStance: Position = activeConversation.userPosition === 'PRO' ? 'CON' : 'PRO';
    const updated: ChatConversation = {
      ...activeConversation,
      userPosition: nextStance,
      updatedAt: new Date().toISOString()
    };
    onUpdateConversation(updated);
  };

  // Handle Adjudicate (Produce 100-pt Judicial Verdict)
  const handleAdjudicateNow = () => {
    if (!activeConversation || activeConversation.messages.length === 0) {
      alert('Submit at least one argument before requesting adjudication.');
      return;
    }

    // Convert ChatMessages to DebateSession & DebateMessages for Judicial engine
    const sessionObj = {
      id: activeConversation.id,
      userId: user.id,
      topic: activeConversation.topic,
      category: 'Philosophy' as any,
      userPosition: activeConversation.userPosition,
      aiPosition: (activeConversation.userPosition === 'PRO' ? 'CON' : 'PRO') as Position,
      difficulty: 'Intermediate' as any,
      rounds: Math.max(3, Math.ceil(activeConversation.messages.length / 2)),
      currentRound: Math.max(1, Math.ceil(activeConversation.messages.length / 2)),
      currentPhase: 'Final Verdict',
      status: 'completed' as any,
      createdAt: activeConversation.createdAt,
      updatedAt: new Date().toISOString()
    };

    const debateMessages = activeConversation.messages.map((m, idx) => ({
      id: m.id,
      sessionId: activeConversation.id,
      sender: m.sender === 'user' ? ('user' as const) : ('ai' as const),
      roundNumber: Math.floor(idx / 2) + 1,
      phaseName: 'Rebuttal',
      message: m.content,
      timestamp: m.timestamp,
      analysis: m.analysis,
      fallacies: m.fallacies
    }));

    const result = judgeDebateClient(sessionObj, debateMessages);
    onAdjudicateToResults(result);
  };

  // Persona labels & styling
  const PERSONA_CONFIG: Record<DebatePersona, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    adversary: {
      label: 'Sparring Opponent',
      icon: <Swords className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-950/30 text-rose-300',
      desc: 'Formidable dialectic adversary who defends the opposing stance with sharp warrants.'
    },
    coach: {
      label: 'Debate Coach',
      icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
      desc: 'Evaluates your rhetoric, spots logical fallacies, and demonstrates upgraded arguments.'
    },
    socratic: {
      label: 'Socratic Inquirer',
      icon: <Compass className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
      desc: 'Challenges assumptions through penetrating questions to reveal unexamined premises.'
    },
    referee: {
      label: 'Neutral Adjudicator',
      icon: <Scale className="w-4 h-4 text-indigo-400" />,
      color: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300',
      desc: 'Dispassionately audits burdens of proof and highlights what evidence is needed.'
    }
  };

  const currentPersonaInfo = PERSONA_CONFIG[activeConversation?.persona || 'adversary'];

  return (
    <div id="chatbot-container" className="flex-1 flex flex-col h-[calc(100vh-64px)] bg-[#070a14] text-slate-100 overflow-hidden relative">
      
      {/* 1. ChatGPT-style Top Navigation Header */}
      <header className="h-14 shrink-0 border-b border-slate-800/80 bg-[#090d1c]/90 backdrop-blur-md px-4 flex items-center justify-between z-10">
        
        {/* Left: Persona Switcher Dropdown & Topic Info */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          
          {/* Persona Menu Button */}
          <div className="relative">
            <button
              type="button"
              id="chatbot-persona-toggle"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:bg-slate-800/60 ${currentPersonaInfo.color}`}
            >
              {currentPersonaInfo.icon}
              <span className="hidden sm:inline font-bold">{currentPersonaInfo.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showPersonaMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700/80 p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select AI Chatbot Mode
                </div>
                {(Object.keys(PERSONA_CONFIG) as DebatePersona[]).map((pKey) => {
                  const p = PERSONA_CONFIG[pKey];
                  const isSelected = activeConversation?.persona === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => handleSelectPersona(pKey)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600/20 border border-indigo-500/50 text-white' 
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{p.icon}</div>
                      <div>
                        <div className="text-xs font-bold">{p.label}</div>
                        <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{p.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Topic Title Pill */}
          <button
            type="button"
            onClick={() => setShowTopicModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 cursor-pointer max-w-[180px] sm:max-w-[280px] md:max-w-[380px] truncate"
            title="Click to set or change debate topic"
          >
            <span className="font-semibold truncate">
              {activeConversation?.topic || 'Open Debate'}
            </span>
          </button>

          {/* Stance Toggle (PRO vs CON) */}
          <button
            type="button"
            id="chatbot-stance-toggle"
            onClick={handleToggleStance}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase border cursor-pointer transition-all ${
              activeConversation?.userPosition === 'PRO'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/40'
            }`}
            title="Click to flip your stance (PRO / CON)"
          >
            I ARGUE: {activeConversation?.userPosition || 'PRO'}
          </button>
        </div>

        {/* Right: Actions (Adjudicate, New Chat, Arena Switch) */}
        <div className="flex items-center gap-2">
          
          {/* Adjudicate Button */}
          {activeConversation && activeConversation.messages.length > 0 && (
            <button
              type="button"
              id="chatbot-adjudicate-btn"
              onClick={handleAdjudicateNow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="Request Supreme AI Judicial Council to evaluate conversation and declare a winner"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Judge & Score</span>
            </button>
          )}

          {/* New Chat Button */}
          <button
            type="button"
            id="chatbot-new-chat-btn"
            onClick={() => onNewConversation()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer transition-colors"
            title="Start a fresh debate session"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Debate</span>
          </button>
        </div>
      </header>

      {/* 2. Main Chat Messages Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* EMPTY STATE: ChatGPT-style Welcome & Starter Prompt Cards */}
          {(!activeConversation || activeConversation.messages.length === 0) && (
            <div className="py-8 md:py-14 text-center space-y-8 animate-in fade-in duration-300">
              
              <div className="space-y-3">
                {/* Emblem */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-purple-900/40 text-white mb-2">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ChatGPT-Style Debate & Inquiries</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Ask anything — even out-of-the-box questions
                </h1>
                <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  DebateAI engages with bizarre hypotheticals, philosophical paradoxes, pop-culture disputes, and serious motions with dialectic depth, wit, and evidence.
                </p>
              </div>

              {/* Tab Selector: Out-of-the-Box vs Policy */}
              <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStarterTab('out_of_the_box')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    starterTab === 'out_of_the_box'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🛸 Out-of-the-Box Inquiries
                </button>
                <button
                  type="button"
                  onClick={() => setStarterTab('policy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    starterTab === 'policy'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚖️ Formal Motions
                </button>
              </div>

              {/* Starter Topic Cards Grid */}
              {starterTab === 'out_of_the_box' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
                  {OUT_OF_THE_BOX_QUESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (activeConversation) {
                          const updated: ChatConversation = {
                            ...activeConversation,
                            topic: item.title,
                            title: item.title.slice(0, 34) + '...',
                            updatedAt: new Date().toISOString()
                          };
                          onUpdateConversation(updated);
                          handleSendMessage(item.prompt);
                        }
                      }}
                      className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/50 text-slate-200 transition-all cursor-pointer group space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <span>{item.icon}</span>
                          <span>{item.category}</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          {item.tag}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors line-clamp-2">
                        "{item.title}"
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-300 font-medium">
                        <span>Ask this question</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
                  {STARTER_TOPICS.map((topicItem, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (activeConversation) {
                          const updated: ChatConversation = {
                            ...activeConversation,
                            topic: topicItem.title,
                            title: topicItem.title.slice(0, 34) + '...',
                            userPosition: topicItem.stance,
                            updatedAt: new Date().toISOString()
                          };
                          onUpdateConversation(updated);
                          handleSendMessage(`I would like to debate this motion: "${topicItem.title}". I will defend the ${topicItem.stance} position.`);
                        }
                      }}
                      className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/50 text-slate-200 transition-all cursor-pointer group space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          {topicItem.category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          {topicItem.tag}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors line-clamp-2">
                        "{topicItem.title}"
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-300 font-medium">
                        <span>Spar on this motion</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Mode Helper Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Current Mode: <strong className="text-slate-200">{currentPersonaInfo.label}</strong>. Switch modes anytime from the top bar.</span>
              </div>
            </div>
          )}

          {/* ACTIVE MESSAGES STREAM */}
          {activeConversation && activeConversation.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingId === msg.id;
            const isCopied = copiedId === msg.id;
            const isAnalysisExpanded = expandedAnalysisId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-2 ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
              >
                {/* Author row */}
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 px-1">
                  {isUser ? (
                    <>
                      <span>You ({activeConversation.userPosition})</span>
                      <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                        AI
                      </div>
                      <span>DebateAI ({currentPersonaInfo.label})</span>
                    </>
                  )}
                </div>

                {/* Message Bubble Container */}
                <div
                  className={`relative max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed transition-all shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-900/40 via-indigo-950/40 to-slate-900/90 border border-indigo-700/40 text-slate-100 rounded-tr-sm'
                      : 'bg-slate-900/80 border border-slate-800/90 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  {/* Message Content with simple Markdown rendering */}
                  <div className="whitespace-pre-wrap font-normal selection:bg-indigo-500 selection:text-white">
                    {msg.content.split('\n\n').map((para, pIdx) => {
                      if (para.startsWith('### ')) {
                        return <h4 key={pIdx} className="font-bold text-base text-white mt-2 mb-1.5">{para.replace('### ', '')}</h4>;
                      }
                      if (para.startsWith('> ')) {
                        return (
                          <blockquote key={pIdx} className="border-l-2 border-indigo-500 pl-3 py-1 my-2 italic text-slate-300 text-xs bg-slate-950/40 rounded-r">
                            {para.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return <p key={pIdx} className="mb-2 last:mb-0">{para}</p>;
                    })}
                  </div>

                  {/* Actions Bar (Copy, Text-to-Speech) */}
                  <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-slate-800/60 text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Copy message"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSpeak(msg.id, msg.content)}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                        isSpeaking ? 'text-amber-400 bg-amber-500/10' : 'hover:text-slate-200'
                      }`}
                      title={isSpeaking ? 'Stop reading' : 'Read argument aloud'}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Inline Expandable Debate Analysis Chip (under user messages) */}
                {isUser && msg.analysis && (
                  <div className="max-w-[90%] sm:max-w-[85%] space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setExpandedAnalysisId(isAnalysisExpanded ? null : msg.id)}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Argument Score: <strong className="text-white">{msg.analysis.overallScore}/10</strong></span>
                      {msg.fallacies && msg.fallacies.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/20 px-1.5 py-0.2 rounded font-bold">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {msg.fallacies.length} Fallacy Flag
                        </span>
                      )}
                      {isAnalysisExpanded ? <ChevronUp className="w-3 h-3 ml-1 opacity-70" /> : <ChevronDown className="w-3 h-3 ml-1 opacity-70" />}
                    </button>

                    {/* Expanded Breakdown */}
                    {isAnalysisExpanded && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3 shadow-xl animate-in zoom-in-95">
                        
                        {/* 3 Core Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 font-medium">Logic</div>
                            <div className="text-sm font-bold text-indigo-300">{msg.analysis.logicScore}/10</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 font-medium">Evidence</div>
                            <div className="text-sm font-bold text-emerald-300">{msg.analysis.evidenceScore}/10</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 font-medium">Rebuttal</div>
                            <div className="text-sm font-bold text-amber-300">{msg.analysis.rebuttalScore}/10</div>
                          </div>
                        </div>

                        {/* Fallacy Warnings */}
                        {msg.fallacies && msg.fallacies.length > 0 && (
                          <div className="space-y-1.5">
                            {msg.fallacies.map((fal, fIdx) => (
                              <div key={fIdx} className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 space-y-1">
                                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>{fal.fallacyType}</span>
                                </div>
                                <p className="text-slate-300">{fal.explanation}</p>
                                <p className="text-amber-300 font-medium">💡 Fix: {fal.suggestion}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Coach Tip */}
                        {msg.analysis.suggestion && (
                          <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300">
                            <strong>💡 Next Turn Tip:</strong> {msg.analysis.suggestion}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking Animation */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-in fade-in">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1">
                AI
              </div>
              <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-900/80 border border-slate-800 text-sm text-slate-300 flex items-center gap-3">
                <div className="flex space-x-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-slate-400">{loadingText || 'Formulating argument...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. ChatGPT-style Floating/Sticky Bottom Input Bar */}
      <footer className="p-4 bg-gradient-to-t from-[#060812] via-[#070a14] to-transparent shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          
          {/* Quick Prompt Suggestions above input */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSendMessage('Is a hotdog a sandwich, or does the Cube Rule of Food make it a taco? Give me a comprehensive dialectical breakdown.')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:text-indigo-200 shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🌭</span>
              <span>Hotdog debate</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Who would win: 1 billion lions or the Sun? Analyze the thermodynamics, mass, and gravitational mechanics.')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:text-indigo-200 shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🦁</span>
              <span>1B Lions vs Sun</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('What if gravity suddenly stopped for 5 seconds everywhere on Earth?')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:text-indigo-200 shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🌌</span>
              <span>Gravity stops 5s</span>
            </button>
            {activeConversation && activeConversation.messages.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Suggest a counter-argument to my opponent\'s points')}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 shrink-0 cursor-pointer transition-colors"
                >
                  Suggest counterpoint
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Audit our exchange: what logical fallacies have been committed so far?')}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 shrink-0 cursor-pointer transition-colors"
                >
                  Audit fallacies
                </button>
                <button
                  type="button"
                  onClick={handleAdjudicateNow}
                  className="px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-600/40 text-indigo-300 hover:bg-indigo-900/60 shrink-0 cursor-pointer transition-colors"
                >
                  ⚖️ Judge & Score
                </button>
              </>
            )}
          </div>

          {/* Main ChatGPT Input Box */}
          <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-xl transition-all flex items-end p-2 gap-2">
            
            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              id="chatbot-prompt-textarea"
              rows={1}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any out-of-the-box question, philosophical paradox, hypothetical, or debate premise... (Enter to send)"
              className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder-slate-500 px-2 py-1.5 focus:outline-none max-h-[180px] min-h-[28px] leading-relaxed"
            />

            {/* Mic / Voice Input Button */}
            <button
              type="button"
              id="chatbot-mic-btn"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={isRecording ? 'Listening... click to stop' : 'Voice input'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              id="chatbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputVal.trim() || isLoading}
              className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                inputVal.trim() && !isLoading
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Send argument (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-slate-500">
              DebateAI can make mistakes. Verify critical facts and empirical claims independently.
            </span>
          </div>
        </div>
      </footer>

      {/* Topic Change Modal */}
      {showTopicModal && (
        <div 
          id="chatbot-topic-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTopicModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Set Debate Motion / Topic</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter any proposition, policy resolution, or philosophical question you wish to spar over.
            </p>

            <input
              type="text"
              value={customTopicInput || activeConversation?.topic || ''}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              placeholder="e.g., Artificial intelligence should be granted intellectual property rights"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTopicModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeConversation && customTopicInput.trim()) {
                    const updated: ChatConversation = {
                      ...activeConversation,
                      topic: customTopicInput.trim(),
                      title: customTopicInput.trim().slice(0, 34) + '...',
                      updatedAt: new Date().toISOString()
                    };
                    onUpdateConversation(updated);
                  }
                  setShowTopicModal(false);
                }}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer"
              >
                Apply Topic
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
