import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SetupView } from './components/SetupView';
import { LiveDebateView } from './components/LiveDebateView';
import { ResultsView } from './components/ResultsView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { TranscriptModal } from './components/TranscriptModal';
import { AuthView } from './components/AuthView';

import { 
  User, 
  DashboardStats, 
  DebateSession, 
  DebateMessage, 
  ArgumentAnalysis, 
  FallacyDetection, 
  DebateResult, 
  Position, 
  Difficulty, 
  TopicCategory,
  AppView,
  AuthMode
} from './types';

import { INITIAL_USER, INITIAL_DASHBOARD_STATS, INITIAL_RESULTS } from './data/mockData';
import { DEBATE_PHASES } from './data/topics';
import { 
  requestDebaterResponse, 
  requestArgumentAnalysis, 
  requestFallacyDetection, 
  requestJudgeResult 
} from './services/debateService';

// Audio chime for turn transitions and verdicts
function playChime(type: 'turn' | 'success' | 'alert') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'turn') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'success') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.25);
      });
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
}

export default function App() {
  // Navigation State (defaults to setup matching DC.png)
  const [currentView, setCurrentView] = useState<AppView>('setup');
  const [authInitialMode, setAuthInitialMode] = useState<AuthMode>('login');

  // User State (persisted locally)
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('debateai_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      } catch (e) { /* fallback */ }
    }
    return INITIAL_USER;
  });

  // Auth helper handlers
  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setAuthInitialMode(mode);
    setCurrentView('auth');
  };

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentView('setup');
    triggerAudio('success');
  };

  const handleSignOut = () => {
    setUser((prev) => ({
      ...prev,
      isAuthenticated: false
    }));
    setAuthInitialMode('login');
    setCurrentView('auth');
    triggerAudio('turn');
  };

  // Dashboard Stats (persisted locally)
  const [stats, setStats] = useState<DashboardStats>(() => {
    const saved = localStorage.getItem('debateai_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_DASHBOARD_STATS;
  });

  // Past Debate Results (persisted locally)
  const [pastResults, setPastResults] = useState<DebateResult[]>(() => {
    const saved = localStorage.getItem('debateai_past_results');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_RESULTS;
  });

  // Pre-filled motion setup state
  const [setupTopic, setSetupTopic] = useState<string>('');
  const [setupCategory, setSetupCategory] = useState<TopicCategory>('Technology');

  // Active Debate State
  const [currentSession, setCurrentSession] = useState<DebateSession | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<ArgumentAnalysis | undefined>();
  const [latestFallacies, setLatestFallacies] = useState<FallacyDetection[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('');

  // Selected Result for Results Page or Modal
  const [currentResult, setCurrentResult] = useState<DebateResult | null>(null);
  const [transcriptModalResult, setTranscriptModalResult] = useState<DebateResult | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('debateai_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('debateai_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('debateai_past_results', JSON.stringify(pastResults));
  }, [pastResults]);

  // Audio helper respecting user settings
  const triggerAudio = (type: 'turn' | 'success' | 'alert') => {
    if (user.notificationPreferences?.soundEffects) {
      playChime(type);
    }
  };

  // Launch Debate Session from Setup View
  const handleStartDebate = (config: {
    topic: string;
    category: TopicCategory;
    userPosition: Position;
    difficulty: Difficulty;
    rounds: number;
    timeLimitMinutes?: number;
  }) => {
    const newSession: DebateSession = {
      id: `session-${Date.now()}`,
      userId: user.id,
      topic: config.topic,
      category: config.category,
      userPosition: config.userPosition,
      aiPosition: config.userPosition === 'PRO' ? 'CON' : 'PRO',
      difficulty: config.difficulty,
      rounds: config.rounds,
      currentRound: 1,
      currentPhase: DEBATE_PHASES[0].name,
      timeLimitMinutes: config.timeLimitMinutes,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentSession(newSession);
    setMessages([]);
    setLatestAnalysis(undefined);
    setLatestFallacies([]);
    setCurrentView('debate');
    triggerAudio('turn');
  };

  // Handle User Submitting an Argument Turn
  const handleSendArgument = async (argumentText: string) => {
    if (!currentSession || isLoadingAI) return;

    const currentRound = currentSession.currentRound;
    const currentPhase = currentSession.currentPhase;

    // 1. Add User Message
    const userMsg: DebateMessage = {
      id: `msg-${Date.now()}`,
      sessionId: currentSession.id,
      sender: 'user',
      message: argumentText,
      roundNumber: currentRound,
      phaseName: currentPhase,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoadingAI(true);
    setLoadingStepText('Argument Analyzer Agent is inspecting logical premises...');

    try {
      // 2. Analyze User Argument in parallel with Fallacy Detection
      const [analysisResult, fallaciesResult] = await Promise.all([
        requestArgumentAnalysis(currentSession, argumentText),
        requestFallacyDetection(currentSession, argumentText)
      ]);

      setLatestAnalysis(analysisResult);
      setLatestFallacies(fallaciesResult);

      if (fallaciesResult.length > 0) {
        triggerAudio('alert');
      }

      // 3. AI Opponent Turn
      setLoadingStepText('AI Opponent Debater Agent is crafting adversarial counterargument...');

      const debaterResponse = await requestDebaterResponse(
        currentSession,
        updatedMessages,
        argumentText
      );

      const aiMsg: DebateMessage = {
        id: `msg-${Date.now() + 1}`,
        sessionId: currentSession.id,
        sender: 'ai',
        message: debaterResponse.message,
        roundNumber: currentRound,
        phaseName: debaterResponse.phaseName || currentPhase,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      triggerAudio('turn');

      // 4. Progress Round or Conclude
      if (currentRound >= currentSession.rounds) {
        // Automatically conclude if final round has ended
        setLoadingStepText('Final round concluded. Convening AI Judicial Council...');
        await executeDebateAdjudication(finalMessages);
      } else {
        const nextRound = currentRound + 1;
        const nextPhase = DEBATE_PHASES.find(p => p.round === nextRound)?.name || 'Rebuttal & Extension';
        setCurrentSession(prev => prev ? {
          ...prev,
          currentRound: nextRound,
          currentPhase: nextPhase,
          updatedAt: new Date().toISOString()
        } : null);
      }

    } catch (err) {
      console.error('Debate turn error:', err);
    } finally {
      setIsLoadingAI(false);
      setLoadingStepText('');
    }
  };

  // Conclude Debate & Call AI Judge
  const executeDebateAdjudication = async (debateMessages: DebateMessage[]) => {
    if (!currentSession) return;
    setIsLoadingAI(true);
    setLoadingStepText('Supreme AI Judicial Council is evaluating arguments across all 6 dialectic dimensions...');

    try {
      const result = await requestJudgeResult(currentSession, debateMessages);

      // Update Past Results
      setPastResults(prev => [result, ...prev]);

      // Update Dashboard Statistics
      setStats(prev => {
        const newTotal = prev.totalDebates + 1;
        const newWon = result.winner === 'user' ? prev.debatesWon + 1 : prev.debatesWon;
        const newLost = result.winner === 'ai' ? prev.debatesLost + 1 : prev.debatesLost;
        const newTied = result.winner === 'tie' ? prev.debatesTied + 1 : prev.debatesTied;
        const newWinRate = Math.round((newWon / newTotal) * 100);
        const newAvg = Math.round(((prev.averageScore * prev.totalDebates) + result.userScore) / newTotal);
        const newBest = Math.max(prev.bestScore, result.userScore);

        // Update most debated by category
        const catList = [...(prev.mostDebatedByCategory[result.category] || [])];
        const existingTopicIdx = catList.findIndex(t => t.topic.toLowerCase() === result.topic.toLowerCase());
        if (existingTopicIdx >= 0) {
          catList[existingTopicIdx].count += 1;
        } else {
          catList.push({ topic: result.topic, count: 1 });
        }
        catList.sort((a, b) => b.count - a.count);

        // Update skill progress
        const newSkillProgress = [
          ...prev.skillProgress,
          {
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            overall: result.userScore,
            logic: result.userCategoryScores.logicalReasoning * 4,
            rebuttal: result.userCategoryScores.rebuttalQuality * 5
          }
        ].slice(-7);

        return {
          ...prev,
          totalDebates: newTotal,
          debatesWon: newWon,
          debatesLost: newLost,
          debatesTied: newTied,
          winRate: newWinRate,
          averageScore: newAvg,
          bestScore: newBest,
          mostDebatedByCategory: {
            ...prev.mostDebatedByCategory,
            [result.category]: catList
          },
          skillProgress: newSkillProgress,
          recentDebates: [
            {
              id: result.id,
              topic: result.topic,
              category: result.category,
              userPosition: result.userPosition,
              winner: result.winner,
              userScore: result.userScore,
              aiScore: result.aiScore,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            },
            ...prev.recentDebates
          ].slice(0, 8)
        };
      });

      setCurrentResult(result);
      setCurrentView('results');
      triggerAudio('success');

    } catch (err) {
      console.error('Adjudication error:', err);
    } finally {
      setIsLoadingAI(false);
      setLoadingStepText('');
    }
  };

  const handleManualConcludeDebate = async () => {
    if (messages.length === 0) return;
    await executeDebateAdjudication(messages);
  };

  // Select Topic from Dashboard to Debate
  const handleSelectTopicFromDashboard = (topicTitle: string, category: TopicCategory) => {
    setSetupTopic(topicTitle);
    setSetupCategory(category);
    setCurrentView('setup');
  };

  // View Evaluation from Dashboard or History
  const handleViewResult = (resultId: string) => {
    const found = pastResults.find(r => r.id === resultId);
    if (found) {
      setCurrentResult(found);
      setCurrentView('results');
    }
  };

  // Export debate data as JSON
  const handleExportData = () => {
    const data = {
      user,
      stats,
      pastResults,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debateai-user-profile-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset Statistics
  const handleResetStats = () => {
    setStats({
      totalDebates: 0,
      debatesWon: 0,
      debatesLost: 0,
      debatesTied: 0,
      averageScore: 0,
      winRate: 0,
      bestScore: 0,
      mostDebatedTopics: [],
      mostDebatedByCategory: {
        Technology: [],
        Ethics: [],
        Politics: [],
        Science: [],
        Philosophy: [],
        Economics: [],
        Education: [],
        Environment: []
      },
      skillProgress: [],
      recentDebates: []
    });
    setPastResults([]);
    localStorage.removeItem('debateai_stats');
    localStorage.removeItem('debateai_past_results');
  };

  return (
    <div className="min-h-screen bg-[#060812] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header matching DC.png */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        hasActiveDebate={currentSession?.status === 'active'}
        onResetSession={() => {
          setCurrentSession(null);
          setMessages([]);
        }}
        onSignOut={handleSignOut}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Workspace Layout with Left Sidebar matching DC.png */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          user={user}
          onOpenAuth={handleOpenAuth}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col items-center justify-start min-h-[calc(100vh-64px)]">
          
          {/* Authentication View (Login / Sign In, Sign Up / Register, Forgot Password) */}
          {currentView === 'auth' && (
            <div className="w-full max-w-4xl flex items-center justify-center">
              <AuthView
                initialMode={authInitialMode}
                onLoginSuccess={handleLoginSuccess}
                onCancel={() => setCurrentView('setup')}
              />
            </div>
          )}

          {/* Setup View (Primary DC.png interface) */}
          {currentView === 'setup' && (
            <SetupView
              initialTopic={setupTopic || 'Should Artificial Intelligence replace human teachers?'}
              initialCategory={setupCategory}
              onStartDebate={handleStartDebate}
            />
          )}

          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="w-full max-w-7xl">
              <DashboardView
                stats={stats}
                onStartDebate={() => {
                  setSetupTopic('');
                  setCurrentView('setup');
                }}
                onSelectTopicForDebate={handleSelectTopicFromDashboard}
                onViewResult={handleViewResult}
                pastResults={pastResults}
              />
            </div>
          )}

          {/* Live Debate Arena View */}
          {currentView === 'debate' && currentSession && (
            <div className="w-full max-w-7xl">
              <LiveDebateView
                session={currentSession}
                messages={messages}
                latestAnalysis={latestAnalysis}
                latestFallacies={latestFallacies}
                isLoadingAI={isLoadingAI}
                loadingStepText={loadingStepText}
                onSendArgument={handleSendArgument}
                onConcludeDebate={handleManualConcludeDebate}
              />
            </div>
          )}

          {/* Results View */}
          {currentView === 'results' && currentResult && (
            <div className="w-full max-w-7xl">
              <ResultsView
                result={currentResult}
                onNewDebate={() => {
                  setSetupTopic('');
                  setCurrentView('setup');
                }}
                onViewDashboard={() => setCurrentView('dashboard')}
                onViewTranscript={() => setTranscriptModalResult(currentResult)}
              />
            </div>
          )}

          {/* History View */}
          {currentView === 'history' && (
            <div className="w-full max-w-7xl">
              <HistoryView
                results={pastResults}
                onViewResult={handleViewResult}
                onStartDebate={() => {
                  setSetupTopic('');
                  setCurrentView('setup');
                }}
              />
            </div>
          )}

          {/* Profile & Settings View */}
          {currentView === 'profile' && (
            <div className="w-full max-w-7xl">
              <ProfileView
                user={user}
                stats={stats}
                onUpdateUser={setUser}
                onExportData={handleExportData}
                onResetStats={handleResetStats}
                onSignOut={handleSignOut}
                onOpenAuth={handleOpenAuth}
                onNavigate={setCurrentView}
              />
            </div>
          )}

        </main>
      </div>

      {/* Transcript Inspection Modal */}
      {transcriptModalResult && (
        <TranscriptModal
          isOpen={Boolean(transcriptModalResult)}
          onClose={() => setTranscriptModalResult(null)}
          result={transcriptModalResult}
          messages={messages.length > 0 && currentSession?.id === transcriptModalResult.sessionId ? messages : []}
        />
      )}

    </div>
  );
}
