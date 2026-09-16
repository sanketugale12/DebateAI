import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Clock, 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  CheckCircle2, 
  Scale, 
  ChevronRight, 
  Award, 
  RefreshCw,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  User as UserIcon,
  Bot,
  Swords,
  Mic,
  MicOff,
  Radio
} from 'lucide-react';
import { 
  DebateSession, 
  DebateMessage, 
  ArgumentAnalysis, 
  FallacyDetection 
} from '../types';
import { DEBATE_PHASES } from '../data/topics';

interface LiveDebateViewProps {
  session: DebateSession;
  messages: DebateMessage[];
  latestAnalysis?: ArgumentAnalysis;
  latestFallacies: FallacyDetection[];
  isLoadingAI: boolean;
  loadingStepText: string;
  onSendArgument: (argumentText: string) => void;
  onConcludeDebate: () => void;
}

export const LiveDebateView: React.FC<LiveDebateViewProps> = ({
  session,
  messages,
  latestAnalysis,
  latestFallacies,
  isLoadingAI,
  loadingStepText,
  onSendArgument,
  onConcludeDebate
}) => {
  const [inputText, setInputText] = useState('');
  const [timeLeft, setTimeLeft] = useState(
    session.timeLimitMinutes ? session.timeLimitMinutes * 60 : 0
  );
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Microphone speech-to-text dictation state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    if (!session.timeLimitMinutes || session.timeLimitMinutes === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [session.timeLimitMinutes]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore error on cleanup
        }
      }
    };
  }, []);

  // Toggle microphone dictation
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    const win = window as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SpeechRecognition?: new () => any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webkitSpeechRecognition?: new () => any;
    };
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError('Microphone speech recognition is not supported in this browser. You can type your argument directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Microphone audio error: ${event.error || 'Check input connection'}`);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let accumulated = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            accumulated += event.results[i][0].transcript;
          }
        }
        if (accumulated) {
          setInputText(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${accumulated.trim()}` : accumulated.trim();
          });
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('Unable to activate microphone. Please check system audio permissions.');
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAI]);

  // Speech synthesis helper
  const handleSpeak = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoadingAI) return;
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
    }
    onSendArgument(inputText.trim());
    setInputText('');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const userMsgsCount = messages.filter(m => m.sender === 'user').length;
  const canConcludeEarly = userMsgsCount >= 2;

  const currentPhaseObj = DEBATE_PHASES.find(p => p.round === session.currentRound) || {
    round: session.currentRound,
    name: session.currentPhase,
    description: 'Present substantive warrants and rebut opponent assertions.'
  };

  return (
    <div className="h-[calc(100vh-6rem)] min-h-[640px] flex flex-col space-y-3 pb-2">
      
      {/* 3-Column Debate Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        
        {/* ================= LEFT PANEL (Debate Context, Rounds & Timer) ================= */}
        <aside className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto space-y-4">
          
          <div className="space-y-4">
            
            {/* Topic Resolution Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {session.category}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {session.difficulty}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">
                "{session.topic}"
              </h2>
            </div>

            {/* Positions Matchup */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Stance Allocation
              </div>

              {/* User Position */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>You</span>
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                  session.userPosition === 'PRO'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {session.userPosition}
                </span>
              </div>

              {/* AI Position */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Opponent</span>
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                  session.aiPosition === 'PRO'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {session.aiPosition}
                </span>
              </div>
            </div>

            {/* Timer (if enabled) */}
            {session.timeLimitMinutes && session.timeLimitMinutes > 0 && (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Turn Timer</span>
                </div>
                <div className="text-sm font-mono font-bold text-amber-400">
                  {formatTimer(timeLeft)}
                </div>
              </div>
            )}

            {/* Structured Debate Flow / Phases */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Rounds Roadmap</span>
                <span className="text-indigo-400">
                  Round {session.currentRound} / {session.rounds}
                </span>
              </div>

              <div className="space-y-1.5">
                {DEBATE_PHASES.slice(0, session.rounds).map((phase) => {
                  const isCurrent = phase.round === session.currentRound;
                  const isPast = phase.round < session.currentRound;
                  return (
                    <div
                      key={phase.round}
                      className={`px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-indigo-600/20 border border-indigo-500/50 text-white font-semibold'
                          : isPast
                          ? 'text-slate-400 bg-slate-800/30'
                          : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isCurrent ? 'bg-indigo-600 text-white' : isPast ? 'bg-emerald-600/60 text-emerald-100' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {phase.round}
                        </span>
                        <span>{phase.name}</span>
                      </div>
                      {isCurrent && <span className="text-[10px] text-amber-400 uppercase font-bold animate-pulse">Active</span>}
                      {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            {canConcludeEarly && (
              <button
                id="debate-conclude-early-btn"
                onClick={onConcludeDebate}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Call AI Judge & Conclude</span>
              </button>
            )}

            <div className="text-[10px] text-slate-400 text-center">
              AI Judge will deliver complete 100-point rubric upon closing.
            </div>
          </div>

        </aside>

        {/* ================= CENTER PANEL (Chat & Conversation Feed) ================= */}
        <main className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-lg">
          
          {/* Conversation Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">
                Live Debate Arena
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-indigo-400 font-medium hidden sm:inline">
                Phase: {currentPhaseObj.name}
              </span>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Agent In-Session</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Swords className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Round 1: Opening Statement</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Begin the debate by establishing your fundamental framework, core definitions, and opening affirmative warrants.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isAI = msg.sender === 'ai';
              const isSpeaking = speakingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  {/* Speaker Label & Phase Tag */}
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'You' : 'AI Opponent'}
                    </span>
                    <span>•</span>
                    <span className="text-indigo-400">{msg.phaseName}</span>
                    <span>•</span>
                    <span>R{msg.roundNumber}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed relative group ${
                      isUser
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-tl-sm shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.message}</div>

                    {/* Speech / Audio Tool */}
                    {isAI && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.message, msg.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                          title="Read out loud"
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span className="text-amber-400">Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Generation / Agent Pipeline Status */}
            {isLoadingAI && (
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-amber-400">AI Agents Orchestrating</span>
                </div>
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-300 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="text-slate-300 font-medium">
                    {loadingStepText || 'AI Debater is formulating counterargument...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* User Input & Prompt Submission Area with Microphone */}
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/60 space-y-2">
            
            {/* Microphone Error Alert */}
            {speechError && (
              <div 
                id="debate-mic-error-alert"
                className="w-full bg-rose-950/60 border border-rose-800/60 text-rose-300 py-1.5 px-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in"
              >
                <span>{speechError}</span>
                <button
                  type="button"
                  onClick={() => setSpeechError(null)}
                  className="text-rose-400 hover:text-rose-200 ml-2 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Active Listening Waveform Banner */}
            {isListening && (
              <div 
                id="debate-mic-active-banner"
                className="w-full bg-rose-950/30 border border-rose-500/30 rounded-xl px-3.5 py-2 flex items-center justify-between animate-in fade-in"
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>

                  <span className="text-xs font-semibold text-rose-200">
                    Listening to your argument... speak clearly into your microphone
                  </span>

                  {/* Animated Audio Equalizer Bars */}
                  <div className="flex items-center gap-0.5 h-4 px-2">
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite] h-2"></span>
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_0.1s] h-4"></span>
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.9s_infinite_0.2s] h-3"></span>
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.7s_infinite_0.3s] h-4"></span>
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_0.15s] h-2"></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleListening}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Done Speaking
                </button>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-2">
              <div className="relative">
                <textarea
                  id="debate-argument-textarea"
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleFormSubmit(e);
                    }
                  }}
                  disabled={isLoadingAI}
                  placeholder={`Round ${session.currentRound} (${currentPhaseObj.name}): Speak into microphone or type your argument...`}
                  className={`w-full bg-slate-800/80 border focus:ring-1 rounded-xl p-3 pr-24 text-sm text-white placeholder-slate-500 resize-none transition-all disabled:opacity-50 ${
                    isListening
                      ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />

                {/* Right Action Icons: Microphone + Send */}
                <div className="absolute right-2 bottom-2.5 flex items-center gap-1.5">
                  {/* Microphone Dictate Button */}
                  <button
                    type="button"
                    id="debate-mic-dictate-btn"
                    onClick={toggleListening}
                    disabled={isLoadingAI}
                    title={isListening ? 'Stop microphone dictation' : 'Dictate argument with microphone'}
                    className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                      isListening
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400/50 animate-pulse'
                        : 'bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-white" />
                    ) : (
                      <Mic className="w-4 h-4 text-indigo-300" />
                    )}
                  </button>

                  {/* Send Argument Button */}
                  <button
                    type="submit"
                    id="debate-send-argument-btn"
                    disabled={!inputText.trim() || isLoadingAI}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center"
                    title="Send Argument (Enter)"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <div className="flex items-center gap-2">
                  <span>{inputText.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span className="hidden sm:inline text-slate-500">•</span>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`hidden sm:inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      isListening ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-indigo-300'
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                    <span>{isListening ? 'Microphone Active' : 'Click Mic to dictate speech'}</span>
                  </button>
                </div>
                <span>Press <strong>Enter</strong> to submit, <strong>Shift+Enter</strong> for newline</span>
              </div>
            </form>
          </div>

        </main>

        {/* ================= RIGHT PANEL (Real-Time Argument Analyzer & Fallacy Detector) ================= */}
        <aside className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Real-Time AI Coach</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Telemetry</span>
          </div>

          {/* Argument Analysis Card */}
          {latestAnalysis ? (
            <div className="space-y-3.5">
              
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Argument Scoring</span>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {latestAnalysis.overallScore} / 10
                  </span>
                </div>

                {/* Score meters */}
                <div className="space-y-1.5 text-[11px]">
                  
                  {/* Logic */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Logic</span>
                      <span className="font-semibold text-slate-200">{latestAnalysis.logicScore}/10</span>
                    </div>
                    <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${latestAnalysis.logicScore * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Evidence</span>
                      <span className="font-semibold text-slate-200">{latestAnalysis.evidenceScore}/10</span>
                    </div>
                    <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${latestAnalysis.evidenceScore * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Relevance */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Relevance</span>
                      <span className="font-semibold text-slate-200">{latestAnalysis.relevanceScore}/10</span>
                    </div>
                    <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${latestAnalysis.relevanceScore * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Clarity */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Clarity</span>
                      <span className="font-semibold text-slate-200">{latestAnalysis.clarityScore}/10</span>
                    </div>
                    <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${latestAnalysis.clarityScore * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Persuasiveness */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Persuasiveness</span>
                      <span className="font-semibold text-slate-200">{latestAnalysis.persuasivenessScore}/10</span>
                    </div>
                    <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-violet-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${latestAnalysis.persuasivenessScore * 10}%` }}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Feedback Insights */}
              <div className="space-y-2 text-xs">
                
                {/* Strength */}
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider block">
                    Key Strength
                  </span>
                  <p className="text-slate-300 leading-snug">{latestAnalysis.strength}</p>
                </div>

                {/* Weakness */}
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 space-y-1">
                  <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider block">
                    Vulnerability
                  </span>
                  <p className="text-slate-300 leading-snug">{latestAnalysis.weakness}</p>
                </div>

                {/* Suggestion */}
                <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                  <span className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider block">
                    Coach Suggestion
                  </span>
                  <p className="text-slate-300 leading-snug">{latestAnalysis.suggestion}</p>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/30 border border-dashed border-slate-700 text-center space-y-2">
              <Brain className="w-6 h-6 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit your first argument to trigger the Argument Analyzer Agent.
              </p>
            </div>
          )}

          {/* Logical Fallacy Detector Card */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Logical Fallacy Auditor</span>
              </span>
              <span className="text-[10px] text-slate-400">Heuristic Engine</span>
            </div>

            {latestFallacies.length > 0 ? (
              <div className="space-y-2">
                {latestFallacies.map((fal, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400">{fal.fallacyType}</span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        Alert
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug">{fal.explanation}</p>
                    <p className="text-amber-300/90 text-[11px] font-medium pt-1">
                      💡 {fal.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px]">No logical fallacies detected in latest speech.</span>
              </div>
            )}
          </div>

        </aside>

      </div>

    </div>
  );
};
