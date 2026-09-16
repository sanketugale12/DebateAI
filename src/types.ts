export type Position = 'PRO' | 'CON';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type SessionStatus = 'setup' | 'active' | 'evaluating' | 'completed' | 'abandoned';
export type MessageSender = 'user' | 'ai' | 'system';

export type TopicCategory = 
  | 'Technology' 
  | 'Ethics' 
  | 'Politics' 
  | 'Science' 
  | 'Philosophy' 
  | 'Economics' 
  | 'Education' 
  | 'Environment';

export interface DebateTopicItem {
  id: string;
  category: TopicCategory;
  title: string;
  description: string;
  proSummary: string;
  conSummary: string;
  popularCount?: number;
}

export interface NotificationPreferences {
  debateReminders: boolean;
  dailyLogicTips: boolean;
  challengeAlerts: boolean;
  emailSummaries: boolean;
  soundEffects: boolean;
}

export interface LinkedAccounts {
  github?: { connected: boolean; username?: string };
  google?: { connected: boolean; email?: string };
  discord?: { connected: boolean; username?: string };
  supabase?: { connected: boolean; email?: string };
}

export type AppView = 
  | 'dashboard' 
  | 'setup' 
  | 'debate' 
  | 'results' 
  | 'history' 
  | 'profile' 
  | 'auth';

export type AuthMode = 'login' | 'signup' | 'forgot-password';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatarUrl: string;
  bio?: string;
  role?: string;
  notificationPreferences: NotificationPreferences;
  linkedAccounts: LinkedAccounts;
  isAuthenticated?: boolean;
}

export interface DebateSession {
  id: string;
  userId: string;
  topic: string;
  category: TopicCategory;
  userPosition: Position;
  aiPosition: Position;
  difficulty: Difficulty;
  rounds: number;
  currentRound: number;
  currentPhase: string;
  status: SessionStatus;
  timeLimitMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DebateMessage {
  id: string;
  sessionId: string;
  sender: MessageSender;
  roundNumber: number;
  phaseName: string;
  message: string;
  timestamp: string;
  analysis?: ArgumentAnalysis;
  fallacies?: FallacyDetection[];
}

export interface ArgumentAnalysis {
  id: string;
  messageId: string;
  logicScore: number;       // 1 - 10
  evidenceScore: number;    // 1 - 10
  relevanceScore: number;   // 1 - 10
  clarityScore: number;     // 1 - 10
  persuasivenessScore: number; // 1 - 10
  rebuttalScore: number;    // 1 - 10
  overallScore: number;     // 1 - 10 average or weighted
  strength: string;
  weakness: string;
  suggestion: string;
}

export interface FallacyDetection {
  id: string;
  messageId: string;
  fallacyType: string;
  explanation: string;
  suggestion: string;
}

export interface CategoryScores {
  logicalReasoning: number; // Max 25
  evidence: number;         // Max 20
  rebuttalQuality: number;  // Max 20
  clarity: number;          // Max 15
  relevance: number;        // Max 10
  persuasiveness: number;   // Max 10
}

export interface DebateResult {
  id: string;
  sessionId: string;
  topic: string;
  category: TopicCategory;
  userPosition: Position;
  aiPosition: Position;
  userScore: number;        // 0 - 100
  aiScore: number;          // 0 - 100
  winner: 'user' | 'ai' | 'tie';
  reason: string;
  userCategoryScores: CategoryScores;
  aiCategoryScores: CategoryScores;
  strongestArgument: {
    quote: string;
    speaker: 'user' | 'ai';
    analysis: string;
  };
  weakestArgument: {
    quote: string;
    speaker: 'user' | 'ai';
    analysis: string;
  };
  bestRebuttal: {
    quote: string;
    speaker: 'user' | 'ai';
    analysis: string;
  };
  detectedFallaciesSummary: string[];
  evidenceQualityFeedback: string;
  communicationQualityFeedback: string;
  improvementSuggestions: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalDebates: number;
  debatesWon: number;
  debatesLost: number;
  debatesTied: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  categoryDistribution: { category: TopicCategory; count: number; winRate: number }[];
  mostDebatedByCategory: Record<TopicCategory, { topic: string; count: number }[]>;
  mostDebatedTopics: { topic: string; count: number; category: TopicCategory }[];
  recentDebates: {
    id: string;
    topic: string;
    category: TopicCategory;
    userPosition: Position;
    aiPosition: Position;
    winner: 'user' | 'ai' | 'tie';
    userScore: number;
    aiScore: number;
    date: string;
    difficulty: Difficulty;
  }[];
  skillProgress: {
    sessionIndex: number;
    date: string;
    logic: number;
    evidence: number;
    rebuttal: number;
    clarity: number;
    persuasiveness: number;
    overall: number;
  }[];
}

export interface DebatePhaseInfo {
  round: number;
  name: string;
  description: string;
  speakerRole: 'user' | 'ai' | 'both';
}
