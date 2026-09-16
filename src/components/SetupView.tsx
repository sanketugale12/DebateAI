import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff,
  Check, 
  Bot, 
  ChevronDown, 
  ArrowRight,
  Shuffle,
  Dices,
  X
} from 'lucide-react';
import { Position, Difficulty, TopicCategory } from '../types';

interface SetupViewProps {
  initialTopic?: string;
  initialCategory?: TopicCategory;
  onStartDebate: (config: {
    topic: string;
    category: TopicCategory;
    userPosition: Position;
    difficulty: Difficulty;
    rounds: number;
    timeLimitMinutes?: number;
  }) => void;
  errorMessage?: string | null;
  onClearError?: () => void;
}

interface SuggestionTopic {
  fullTopic: string;
  category: TopicCategory;
  shortLabel: string;
}

const ALL_TOPICS_POOL: SuggestionTopic[] = [
  {
    fullTopic: 'Should Artificial Intelligence replace human teachers?',
    category: 'Technology',
    shortLabel: 'AI replacing human teachers'
  },
  {
    fullTopic: 'Is social media doing more harm than good to modern society?',
    category: 'Technology',
    shortLabel: 'Social media harm vs benefit'
  },
  {
    fullTopic: 'Should Universal Basic Income (UBI) be adopted globally?',
    category: 'Economics',
    shortLabel: 'Universal Basic Income (UBI)'
  },
  {
    fullTopic: 'Does space exploration justify its enormous economic expense?',
    category: 'Science',
    shortLabel: 'Space exploration expenses'
  },
  {
    fullTopic: 'Should nuclear energy be prioritized to combat climate change?',
    category: 'Environment',
    shortLabel: 'Nuclear energy for climate'
  },
  {
    fullTopic: 'Should governments implement strict regulations on autonomous AI agents?',
    category: 'Technology',
    shortLabel: 'Strict AI regulations'
  },
  {
    fullTopic: 'Should higher education be tuition-free for all citizens?',
    category: 'Education',
    shortLabel: 'Tuition-free higher education'
  },
  {
    fullTopic: 'Is censorship on digital platforms ever justified to curb disinformation?',
    category: 'Politics',
    shortLabel: 'Digital platform censorship'
  },
  {
    fullTopic: 'Should genetic editing in human embryos be universally banned?',
    category: 'Science',
    shortLabel: 'Human embryo gene editing'
  },
  {
    fullTopic: 'Should remote work become a legally protected right for office employees?',
    category: 'Ethics',
    shortLabel: 'Right to remote work'
  },
  {
    fullTopic: 'Is a cashless society beneficial for civil liberties and personal privacy?',
    category: 'Economics',
    shortLabel: 'Cashless society & privacy'
  },
  {
    fullTopic: 'Should voting in national democratic elections be legally mandatory?',
    category: 'Politics',
    shortLabel: 'Mandatory national voting'
  },
  {
    fullTopic: 'Can economic growth remain sustainable on a finite planet?',
    category: 'Environment',
    shortLabel: 'Sustainable economic growth'
  },
  {
    fullTopic: 'Should algorithmic AI art be eligible for intellectual copyright protection?',
    category: 'Technology',
    shortLabel: 'Copyright for AI art'
  },
  {
    fullTopic: 'Is animal testing morally justifiable for life-saving medical research?',
    category: 'Ethics',
    shortLabel: 'Medical animal testing'
  },
  {
    fullTopic: 'Should healthcare be a constitutionally guaranteed universal right?',
    category: 'Ethics',
    shortLabel: 'Universal healthcare right'
  },
  {
    fullTopic: 'Are standardized academic tests an accurate measure of human intelligence?',
    category: 'Education',
    shortLabel: 'Standardized tests validity'
  },
  {
    fullTopic: 'Should deepfake creation without consent be classified as a felony?',
    category: 'Technology',
    shortLabel: 'Criminalizing deepfakes'
  }
];

// Helper to pick n unique random topics from the pool
function getRandomTopics(count: number, excludeFirstTopic?: string): SuggestionTopic[] {
  const filtered = excludeFirstTopic 
    ? ALL_TOPICS_POOL.filter(t => t.fullTopic !== excludeFirstTopic) 
    : [...ALL_TOPICS_POOL];
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const SetupView: React.FC<SetupViewProps> = ({
  initialTopic = '',
  initialCategory = 'Technology',
  onStartDebate,
  errorMessage = null,
  onClearError
}) => {
  const [topic, setTopic] = useState<string>(
    initialTopic || 'Should Artificial Intelligence replace human teachers?'
  );
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory>(initialCategory);
  const [userPosition, setUserPosition] = useState<Position>('PRO');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [rounds, setRounds] = useState<number>(3);
  const [debateMode, setDebateMode] = useState<string>('User vs AI (Primary Mode)');

  // Dynamic Suggestion Topics with Shuffle
  const [displayedSuggestions, setDisplayedSuggestions] = useState<SuggestionTopic[]>(() => 
    ALL_TOPICS_POOL.slice(0, 5)
  );
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  
  // Speech recognition dictation state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const aiPosition: Position = userPosition === 'PRO' ? 'CON' : 'PRO';

  // Shuffle topics handler
  const handleShuffleTopics = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setDisplayedSuggestions(getRandomTopics(5, topic));
      setIsShuffling(false);
    }, 200);
  };

  // Surprise Me / Random Pick handler
  const handleSurpriseMe = () => {
    const randomPick = ALL_TOPICS_POOL[Math.floor(Math.random() * ALL_TOPICS_POOL.length)];
    if (randomPick) {
      setTopic(randomPick.fullTopic);
      setSelectedCategory(randomPick.category);
    }
  };

  // Dictate topic speech recognition
  const handleDictate = () => {
    setSpeechError(null);
    const win = window as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SpeechRecognition?: new () => any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webkitSpeechRecognition?: new () => any;
    };
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError('Microphone speech recognition is not supported in this browser. Please type your topic directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        setSpeechError('Could not capture audio. Please ensure microphone permissions are granted.');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setTopic(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('Microphone access was denied or audio context is inactive.');
    }
  };

  const handleSelectQuickTopic = (item: SuggestionTopic) => {
    setTopic(item.fullTopic);
    setSelectedCategory(item.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onStartDebate({
      topic: topic.trim(),
      category: selectedCategory,
      userPosition,
      difficulty,
      rounds,
      timeLimitMinutes: 3
    });
  };

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 select-none">
      
      {/* Streamlined Card */}
      <div className="max-w-3xl w-full bg-[#0a0e1f]/95 border border-[#1b223d] rounded-2xl p-5 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121838] border border-[#242e61] text-[#818cf8] text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#818cf8]" />
            <span>Debate Setup</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Start a Debate Match
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Choose your resolution, pick a stance, and challenge the multi-agent AI system.
          </p>
        </div>

        {/* Real Error Banner (Only shown if an actual error occurs) */}
        {errorMessage && (
          <div 
            id="setup-error-banner"
            className="w-full bg-rose-950/70 border border-rose-800/80 text-rose-300 py-2.5 px-4 rounded-xl text-xs font-medium flex items-center justify-between"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={onClearError}
              className="text-rose-400 hover:text-rose-200 ml-2 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {speechError && (
          <div className="w-full bg-amber-950/60 border border-amber-800/60 text-amber-300 py-2 px-3.5 rounded-xl text-xs flex items-center justify-between">
            <span>{speechError}</span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-amber-400 hover:text-amber-200 ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 1. TOPIC RESOLUTION & SHUFFLE */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label 
                htmlFor="setup-debate-topic"
                className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>1. Debate Topic</span>
              </label>

              <div className="flex items-center gap-2">
                {/* Random / Surprise Me Button */}
                <button
                  type="button"
                  id="setup-surprise-me-btn"
                  onClick={handleSurpriseMe}
                  title="Randomize debate resolution"
                  className="px-2.5 py-1 rounded-lg bg-[#141b36] hover:bg-[#1c264d] border border-[#242e61] text-indigo-300 hover:text-indigo-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Randomize</span>
                </button>

                {/* Dictate Topic Button with Mic */}
                <button
                  type="button"
                  id="setup-dictate-topic-btn"
                  onClick={handleDictate}
                  title="Dictate topic with microphone"
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600/40 border-rose-500 text-rose-200 shadow-md shadow-rose-900/40 animate-pulse'
                      : 'bg-[#141b36] hover:bg-[#1a2347] border-[#242e61] text-indigo-300 hover:text-indigo-100'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-300" />
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dictate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Listening Banner */}
            {isListening && (
              <div 
                id="setup-mic-listening-banner"
                className="w-full bg-rose-950/40 border border-rose-500/40 rounded-xl px-3 py-2 flex items-center justify-between animate-in fade-in"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-medium text-rose-200">
                    Listening to your voice... Speak resolution clearly.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDictate}
                  className="text-[11px] font-bold text-rose-300 hover:text-white px-2 py-0.5 rounded bg-rose-800/60 hover:bg-rose-700 cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {/* Textarea */}
            <textarea
              id="setup-debate-topic"
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Should Artificial Intelligence replace human teachers?"
              className={`w-full bg-[#070915] border rounded-xl p-3.5 text-white text-sm font-medium resize-none transition-all placeholder-slate-600 outline-hidden ${
                isListening
                  ? 'border-rose-500/80 ring-1 ring-rose-500/30'
                  : 'border-[#1b223d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
              required
            />

            {/* Topic Suggestions with Shuffle Feature */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Suggested Resolutions:
                </span>

                {/* Shuffle Button */}
                <button
                  type="button"
                  id="setup-shuffle-topics-btn"
                  onClick={handleShuffleTopics}
                  title="Shuffle suggestion topics"
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 transition-all cursor-pointer"
                >
                  <Shuffle className={`w-3 h-3 ${isShuffling ? 'animate-spin' : ''}`} />
                  <span>Shuffle Topics</span>
                </button>
              </div>

              {/* Suggestion Pills */}
              <div className="flex flex-wrap gap-1.5">
                {displayedSuggestions.map((item, idx) => {
                  const isSelected = topic === item.fullTopic;
                  return (
                    <button
                      type="button"
                      key={idx}
                      id={`quick-topic-btn-${idx}`}
                      onClick={() => handleSelectQuickTopic(item)}
                      title={item.fullTopic}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-[#4f46e5] bg-[#1a1f42] text-white shadow-sm shadow-indigo-600/20 ring-1 ring-indigo-500/40'
                          : 'border-[#1b223d] bg-[#0c1022] hover:bg-[#131a37] text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="truncate max-w-[240px] sm:max-w-[320px]">
                        {item.shortLabel}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                        {item.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. YOUR POSITION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                2. Your Stance
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                AI Opponent: <strong className="text-white">{aiPosition}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* PRO */}
              <button
                type="button"
                id="position-pro-card"
                onClick={() => setUserPosition('PRO')}
                className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  userPosition === 'PRO'
                    ? 'border-[#4f46e5] bg-[#121634] ring-1 ring-indigo-500/40 shadow-sm'
                    : 'border-[#1b223d] bg-[#0c1022] hover:bg-[#111734]'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>PRO</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
                      Support
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Argue in favor of resolution
                  </div>
                </div>

                {userPosition === 'PRO' && (
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 ml-1" />
                )}
              </button>

              {/* CON */}
              <button
                type="button"
                id="position-con-card"
                onClick={() => setUserPosition('CON')}
                className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  userPosition === 'CON'
                    ? 'border-[#4f46e5] bg-[#121634] ring-1 ring-indigo-500/40 shadow-sm'
                    : 'border-[#1b223d] bg-[#0c1022] hover:bg-[#111734]'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>CON</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-rose-400">
                      Oppose
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Argue against resolution
                  </div>
                </div>

                {userPosition === 'CON' && (
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* 3. OPPONENT DIFFICULTY */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              3. AI Difficulty
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((level) => {
                const isSelected = difficulty === level;
                return (
                  <button
                    type="button"
                    key={level}
                    id={`difficulty-${level.toLowerCase()}-card`}
                    onClick={() => setDifficulty(level)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-[#4f46e5] bg-[#121634] ring-1 ring-indigo-500/40 shadow-sm'
                        : 'border-[#1b223d] bg-[#0c1022] hover:bg-[#111734]'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {level}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {level === 'Beginner' && 'Gentle logic'}
                      {level === 'Intermediate' && 'Balanced challenge'}
                      {level === 'Advanced' && 'Rigorous rebuttals'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. MODE & ROUNDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Debate Mode Dropdown */}
            <div className="space-y-1.5">
              <label 
                htmlFor="setup-debate-mode"
                className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>Debate Mode</span>
              </label>

              <div className="relative">
                <select
                  id="setup-debate-mode"
                  value={debateMode}
                  onChange={(e) => setDebateMode(e.target.value)}
                  className="w-full bg-[#070915] border border-[#1b223d] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-white text-xs font-medium appearance-none cursor-pointer pr-9 outline-hidden"
                >
                  <option value="User vs AI (Primary Mode)">User vs AI (Primary Mode)</option>
                  <option value="AI vs AI (Spectator Mode)">AI vs AI (Spectator Mode)</option>
                  <option value="Speed Round (Rapid Dialectic)">Speed Round (Rapid Dialectic)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Rounds Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Rounds
                </span>
                <span className="text-xs font-bold text-indigo-400 uppercase">
                  {rounds} Rounds
                </span>
              </div>

              {/* Segmented Rounds Buttons for simpler click interaction */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[1, 3, 5].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRounds(r)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      rounds === r
                        ? 'border-[#4f46e5] bg-[#1a1f42] text-white ring-1 ring-indigo-500/40'
                        : 'border-[#1b223d] bg-[#070915] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r} {r === 1 ? 'Quick' : r === 3 ? 'Standard' : 'Full'}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* START DEBATE Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="setup-start-debate-btn"
              className="w-full py-3.5 bg-gradient-to-r from-[#4f46e5] via-[#8b2cf5] to-[#ec1d87] hover:from-[#4338ca] hover:via-[#7c25dc] hover:to-[#db147b] text-white font-extrabold text-sm sm:text-base tracking-wider rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            >
              <span>START DEBATE</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
