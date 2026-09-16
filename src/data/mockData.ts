import { User, DebateResult, DashboardStats, TopicCategory } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_debater_01',
  name: 'Demo Debater',
  email: 'demo@debateai.org',
  createdAt: '2025-01-10T08:00:00Z',
  avatarUrl: '',
  bio: 'Collegiate debate enthusiast and policy debater. Exploring the frontiers of machine ethics, AI governance, and analytical philosophy.',
  role: 'Competitive Debater (Rank 14)',
  notificationPreferences: {
    debateReminders: true,
    dailyLogicTips: true,
    challengeAlerts: true,
    emailSummaries: false,
    soundEffects: true
  },
  linkedAccounts: {
    github: { connected: true, username: 'alexrivera-debate' },
    google: { connected: true, email: 'alex.rivera@debateai.org' },
    discord: { connected: false },
    supabase: { connected: true, email: 'alex.rivera@supabase.io' }
  }
};

export const INITIAL_RESULTS: DebateResult[] = [
  {
    id: 'res_01',
    sessionId: 'sess_01',
    topic: 'Should Artificial Intelligence replace human workers in automated industries?',
    category: 'Technology',
    userPosition: 'PRO',
    aiPosition: 'CON',
    userScore: 84,
    aiScore: 78,
    winner: 'user',
    reason: 'The user presented a tightly reasoned thesis regarding labor reallocation into creative high-touch sectors, effectively neutralizing the AI\'s warnings of structural unemployment with historical automation transitions.',
    userCategoryScores: {
      logicalReasoning: 22,
      evidence: 16,
      rebuttalQuality: 18,
      clarity: 13,
      relevance: 8,
      persuasiveness: 7
    },
    aiCategoryScores: {
      logicalReasoning: 20,
      evidence: 17,
      rebuttalQuality: 15,
      clarity: 13,
      relevance: 7,
      persuasiveness: 6
    },
    strongestArgument: {
      quote: 'Historically, every wave of automation from the steam engine to spreadsheets expanded aggregate employment by shifting human labor up the cognitive value chain rather than permanently abolishing it.',
      speaker: 'user',
      analysis: 'Masterful deployment of macroeconomic historical precedents with clear causal warranting.'
    },
    weakestArgument: {
      quote: 'People simply prefer leisure anyway, so unemployment will naturally feel like an extended vacation.',
      speaker: 'user',
      analysis: 'Dismissed the acute psychological and financial trauma of involuntary unemployment without evidence.'
    },
    bestRebuttal: {
      quote: 'The AI argues that generative models replace cognitive tasks rather than physical ones; however, cognition itself is being multiplied, allowing single individuals to orchestrate entire enterprises.',
      speaker: 'user',
      analysis: 'Directly tackled the AI opposition\'s central novelty claim with an empowering paradigm shift.'
    },
    detectedFallaciesSummary: [
      'Minor Hasty Generalization in Round 2 regarding transition speeds in emerging economies.'
    ],
    evidenceQualityFeedback: 'Good citations of economic history; could be further strengthened with specific empirical wage metrics from recent OECD or IMF studies.',
    communicationQualityFeedback: 'Articulate, confident rhetorical poise, with excellent pacing throughout all 5 rounds.',
    improvementSuggestions: [
      'Anticipate and address short-term capital liquidity crunches faced by vulnerable blue-collar demographics.',
      'Incorporate quantitative data regarding retraining program success rates.',
      'Strengthen opening signposting to clearly delineate ethical arguments from purely fiscal arguments.'
    ],
    createdAt: '2026-09-12T14:20:00Z'
  },
  {
    id: 'res_02',
    sessionId: 'sess_02',
    topic: 'Is universal digital surveillance ethical if it demonstrably eliminates violent crime?',
    category: 'Ethics',
    userPosition: 'CON',
    aiPosition: 'PRO',
    userScore: 88,
    aiScore: 82,
    winner: 'user',
    reason: 'The user successfully established that individual liberty is an essential precondition for genuine moral agency, rendering the AI\'s utilitarian calculation self-defeating.',
    userCategoryScores: {
      logicalReasoning: 24,
      evidence: 18,
      rebuttalQuality: 18,
      clarity: 14,
      relevance: 8,
      persuasiveness: 6
    },
    aiCategoryScores: {
      logicalReasoning: 21,
      evidence: 18,
      rebuttalQuality: 16,
      clarity: 13,
      relevance: 8,
      persuasiveness: 6
    },
    strongestArgument: {
      quote: 'A society without privacy is not peaceful; it is merely pacified by fear. The elimination of dissent destroys the very moral autonomy required to choose virtue over vice.',
      speaker: 'user',
      analysis: 'Profound philosophical distinction between genuine virtue and coerced obedience.'
    },
    weakestArgument: {
      quote: 'Any government that installs cameras will inevitably become North Korea within five years.',
      speaker: 'user',
      analysis: 'Classic slippery slope fallacy asserting absolute inevitability without intermediary steps.'
    },
    bestRebuttal: {
      quote: 'The opposition assumes state administrators will always remain benevolent; history proves surveillance architectures inevitably outlive their well-intentioned creators.',
      speaker: 'user',
      analysis: 'Decisively undercut the opposition\'s foundational assumption of permanent institutional goodwill.'
    },
    detectedFallaciesSummary: [
      'Slippery Slope detected in Round 3 (unwarranted escalation to totalitarian collapse).'
    ],
    evidenceQualityFeedback: 'Deeply grounded in deontological and constitutional jurisprudence, citing Bentham\'s Panopticon and contemporary whistleblower records.',
    communicationQualityFeedback: 'Compelling, solemn, and persuasive tone matching the ethical gravity of the topic.',
    improvementSuggestions: [
      'Acknowledge the tragic trade-off of preventable homicide victims to demonstrate compassionate pragmatism.',
      'Refine the slippery slope assertion into an institutional incentives analysis.'
    ],
    createdAt: '2026-09-10T16:45:00Z'
  },
  {
    id: 'res_03',
    sessionId: 'sess_03',
    topic: 'Should democratic nations impose mandatory voting for all eligible citizens?',
    category: 'Politics',
    userPosition: 'PRO',
    aiPosition: 'CON',
    userScore: 74,
    aiScore: 81,
    winner: 'ai',
    reason: 'The AI exposed that forcing citizens to vote violates freedom of conscience and forces uninformed ballots, while the user struggled to provide mechanisms preventing random protest ballots.',
    userCategoryScores: {
      logicalReasoning: 18,
      evidence: 15,
      rebuttalQuality: 14,
      clarity: 12,
      relevance: 8,
      persuasiveness: 7
    },
    aiCategoryScores: {
      logicalReasoning: 22,
      evidence: 18,
      rebuttalQuality: 17,
      clarity: 13,
      relevance: 5,
      persuasiveness: 6
    },
    strongestArgument: {
      quote: 'Mandatory voting transforms political campaigns from polarizing turnout operations into universal appeal platforms centered on the median voter.',
      speaker: 'user',
      analysis: 'Insightful analysis of how compulsory voting changes campaign incentives.'
    },
    weakestArgument: {
      quote: 'If people don\'t vote, they have no right to complain about anything.',
      speaker: 'user',
      analysis: 'False dilemma and popular colloquialism that fails as a rigorous constitutional warrant.'
    },
    bestRebuttal: {
      quote: 'Compelled participation cannot be equated with genuine civic legitimacy; a mandate merely measures fear of fines, not democratic engagement.',
      speaker: 'ai',
      analysis: 'Piercing refutation of the user\'s primary indicator of health.'
    },
    detectedFallaciesSummary: [
      'False Dilemma in Round 2 (vote or lose rights).',
      'Appeal to Emotion in Round 4.'
    ],
    evidenceQualityFeedback: 'Relied heavily on Australian case studies; needed counter-evidence addressing donkey voting and ballot spoilage rates.',
    communicationQualityFeedback: 'Passionate and articulate, but grew overly defensive when challenged on individual liberty.',
    improvementSuggestions: [
      'Propose a "None of the Above" or blank ballot exemption to satisfy the free speech objection.',
      'Cite empirical research on political polarization before and after mandatory voting laws.'
    ],
    createdAt: '2026-09-08T11:15:00Z'
  },
  {
    id: 'res_04',
    sessionId: 'sess_04',
    topic: 'Is nuclear power essential to achieving carbon-neutral energy grids?',
    category: 'Environment',
    userPosition: 'PRO',
    aiPosition: 'CON',
    userScore: 89,
    aiScore: 83,
    winner: 'user',
    reason: 'User provided impeccable physics and grid-stability data, demonstrating that weather intermittency and mineral battery supply chains cannot realistically scale to 100% baseload in time.',
    userCategoryScores: {
      logicalReasoning: 23,
      evidence: 19,
      rebuttalQuality: 18,
      clarity: 14,
      relevance: 7,
      persuasiveness: 8
    },
    aiCategoryScores: {
      logicalReasoning: 21,
      evidence: 18,
      rebuttalQuality: 16,
      clarity: 13,
      relevance: 8,
      persuasiveness: 7
    },
    strongestArgument: {
      quote: 'Nuclear energy delivers the highest energy density per square meter of any known power source, requiring 100x less land and mining minerals than an equivalent gigawatt solar-plus-storage farm.',
      speaker: 'user',
      analysis: 'Exceptional evidence density directly contrasting land-use impact and grid requirements.'
    },
    weakestArgument: {
      quote: 'Radiation fears are completely made up by Hollywood movies.',
      speaker: 'user',
      analysis: 'Dismissive oversimplification ignoring valid public concerns regarding waste management and decommissioning.'
    },
    bestRebuttal: {
      quote: 'The opponent highlights the French nuclear grid from the 1980s as obsolete, yet France currently produces electricity with one-tenth the carbon intensity of Germany\'s coal-dependent Energiewende.',
      speaker: 'user',
      analysis: 'Devastating empirical comparison that anchored the entire debate.'
    },
    detectedFallaciesSummary: [],
    evidenceQualityFeedback: 'Outstanding mastery of IPCC, IEA, and MIT Energy Initiative technical reports.',
    communicationQualityFeedback: 'Highly authoritative, methodical, and respectful throughout.',
    improvementSuggestions: [
      'Address the upfront financial capital risks and Small Modular Reactor (SMR) licensing delays.',
      'Maintain empathy for communities concerned about radioactive waste storage siting.'
    ],
    createdAt: '2026-09-05T09:30:00Z'
  },
  {
    id: 'res_05',
    sessionId: 'sess_05',
    topic: 'Does human free will exist, or are all decisions strictly deterministic?',
    category: 'Philosophy',
    userPosition: 'CON',
    aiPosition: 'PRO',
    userScore: 86,
    aiScore: 85,
    winner: 'user',
    reason: 'An extraordinarily tight dialectic. The user won by a razor-thin margin by meticulously articulating that determinism does not abolish responsibility, but reframes justice toward rehabilitation.',
    userCategoryScores: {
      logicalReasoning: 23,
      evidence: 18,
      rebuttalQuality: 17,
      clarity: 14,
      relevance: 7,
      persuasiveness: 7
    },
    aiCategoryScores: {
      logicalReasoning: 23,
      evidence: 17,
      rebuttalQuality: 17,
      clarity: 14,
      relevance: 7,
      persuasiveness: 7
    },
    strongestArgument: {
      quote: 'You cannot choose what you will think of next before you think of it. Conscious thoughts emerge from prior subconscious neurochemical cascades that we do not author.',
      speaker: 'user',
      analysis: 'Clear phenomenological demonstration of the limits of conscious intention.'
    },
    weakestArgument: {
      quote: 'Quantum physics is irrelevant to the discussion.',
      speaker: 'user',
      analysis: 'Brushed aside a major physical counterpoint without refuting quantum indeterminacy.'
    },
    bestRebuttal: {
      quote: 'Even if quantum randomness exists in subatomic particles, randomness is chance, not conscious will—it does not rescue intentional agency.',
      speaker: 'user',
      analysis: 'Brilliant conceptual recovery explaining why indeterminism is not the same as freedom.'
    },
    detectedFallaciesSummary: [],
    evidenceQualityFeedback: 'Rich engagement with cognitive neuroscience (Libet experiments) and contemporary compatibilist literature.',
    communicationQualityFeedback: 'Dense yet remarkably lucid philosophical exposition.',
    improvementSuggestions: [
      'Deepen the exploration of moral compatibilism to prevent appearing nihilistic.',
      'Spend more time addressing Daniel Dennett\'s "elbow room" evolutionary agency arguments.'
    ],
    createdAt: '2026-09-02T19:00:00Z'
  }
];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalDebates: 12,
  debatesWon: 8,
  debatesLost: 3,
  debatesTied: 1,
  winRate: 67,
  averageScore: 82.5,
  bestScore: 89,
  categoryDistribution: [
    { category: 'Technology', count: 4, winRate: 75 },
    { category: 'Ethics', count: 3, winRate: 67 },
    { category: 'Philosophy', count: 2, winRate: 100 },
    { category: 'Environment', count: 1, winRate: 100 },
    { category: 'Politics', count: 1, winRate: 0 },
    { category: 'Science', count: 1, winRate: 50 },
    { category: 'Economics', count: 0, winRate: 0 },
    { category: 'Education', count: 0, winRate: 0 }
  ],
  mostDebatedByCategory: {
    Technology: [
      { topic: 'Should Artificial Intelligence replace human workers in automated industries?', count: 2 },
      { topic: 'Should social media algorithms be legally mandated to open-source their ranking logic?', count: 1 },
      { topic: 'Should developers of frontier AI models be held strictly liable for harmful outputs?', count: 1 }
    ],
    Ethics: [
      { topic: 'Is universal digital surveillance ethical if it demonstrably eliminates violent crime?', count: 2 },
      { topic: 'Do sentient non-human animals have fundamental legal rights comparable to humans?', count: 1 }
    ],
    Politics: [
      { topic: 'Should democratic nations impose mandatory voting for all eligible citizens?', count: 1 }
    ],
    Science: [
      { topic: 'Should nations prioritize space colonization over addressing Earth\'s crises?', count: 1 }
    ],
    Philosophy: [
      { topic: 'Does human free will exist, or are all decisions strictly deterministic?', count: 1 },
      { topic: 'Is utilitarianism the most coherent moral framework for governing society?', count: 1 }
    ],
    Economics: [
      { topic: 'Should governments implement a universal basic income (UBI) funded by automation taxes?', count: 0 }
    ],
    Education: [
      { topic: 'Should student use of AI tools like ChatGPT be embraced in academic curricula?', count: 0 }
    ],
    Environment: [
      { topic: 'Is nuclear power essential to achieving carbon-neutral energy grids?', count: 1 }
    ]
  },
  mostDebatedTopics: [
    { topic: 'Should Artificial Intelligence replace human workers in automated industries?', count: 2, category: 'Technology' },
    { topic: 'Is universal digital surveillance ethical if it demonstrably eliminates violent crime?', count: 2, category: 'Ethics' },
    { topic: 'Is nuclear power essential to achieving carbon-neutral energy grids?', count: 1, category: 'Environment' },
    { topic: 'Does human free will exist, or are all decisions strictly deterministic?', count: 1, category: 'Philosophy' },
    { topic: 'Should democratic nations impose mandatory voting for all eligible citizens?', count: 1, category: 'Politics' }
  ],
  recentDebates: [
    {
      id: 'res_01',
      topic: 'Should Artificial Intelligence replace human workers in automated industries?',
      category: 'Technology',
      userPosition: 'PRO',
      aiPosition: 'CON',
      winner: 'user',
      userScore: 84,
      aiScore: 78,
      date: '2026-09-12',
      difficulty: 'Intermediate'
    },
    {
      id: 'res_02',
      topic: 'Is universal digital surveillance ethical if it demonstrably eliminates violent crime?',
      category: 'Ethics',
      userPosition: 'CON',
      aiPosition: 'PRO',
      winner: 'user',
      userScore: 88,
      aiScore: 82,
      date: '2026-09-10',
      difficulty: 'Advanced'
    },
    {
      id: 'res_03',
      topic: 'Should democratic nations impose mandatory voting for all eligible citizens?',
      category: 'Politics',
      userPosition: 'PRO',
      aiPosition: 'CON',
      winner: 'ai',
      userScore: 74,
      aiScore: 81,
      date: '2026-09-08',
      difficulty: 'Intermediate'
    },
    {
      id: 'res_04',
      topic: 'Is nuclear power essential to achieving carbon-neutral energy grids?',
      category: 'Environment',
      userPosition: 'PRO',
      aiPosition: 'CON',
      winner: 'user',
      userScore: 89,
      aiScore: 83,
      date: '2026-09-05',
      difficulty: 'Advanced'
    },
    {
      id: 'res_05',
      topic: 'Does human free will exist, or are all decisions strictly deterministic?',
      category: 'Philosophy',
      userPosition: 'CON',
      aiPosition: 'PRO',
      winner: 'user',
      userScore: 86,
      aiScore: 85,
      date: '2026-09-02',
      difficulty: 'Advanced'
    }
  ],
  skillProgress: [
    { sessionIndex: 1, date: 'Aug 20', logic: 16, evidence: 12, rebuttal: 13, clarity: 11, persuasiveness: 6, overall: 70 },
    { sessionIndex: 2, date: 'Aug 25', logic: 18, evidence: 14, rebuttal: 14, clarity: 12, persuasiveness: 6, overall: 74 },
    { sessionIndex: 3, date: 'Aug 30', logic: 19, evidence: 15, rebuttal: 16, clarity: 13, persuasiveness: 7, overall: 78 },
    { sessionIndex: 4, date: 'Sep 02', logic: 23, evidence: 18, rebuttal: 17, clarity: 14, persuasiveness: 7, overall: 86 },
    { sessionIndex: 5, date: 'Sep 08', logic: 18, evidence: 15, rebuttal: 14, clarity: 12, persuasiveness: 7, overall: 74 },
    { sessionIndex: 6, date: 'Sep 10', logic: 24, evidence: 18, rebuttal: 18, clarity: 14, persuasiveness: 6, overall: 88 },
    { sessionIndex: 7, date: 'Sep 12', logic: 22, evidence: 16, rebuttal: 18, clarity: 13, persuasiveness: 7, overall: 84 }
  ]
};
