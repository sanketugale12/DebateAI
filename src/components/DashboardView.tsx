import React, { useState } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Flame, 
  Swords, 
  ArrowUpRight, 
  BookOpen, 
  Scale, 
  Brain, 
  Cpu, 
  Landmark, 
  Atom, 
  Leaf, 
  GraduationCap, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { DashboardStats, TopicCategory, DebateResult } from '../types';
import { TOPIC_CATEGORIES } from '../data/topics';

interface DashboardViewProps {
  stats: DashboardStats;
  onStartDebate: () => void;
  onSelectTopicForDebate: (topicTitle: string, category: TopicCategory) => void;
  onViewResult: (resultId: string) => void;
  pastResults: DebateResult[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onStartDebate,
  onSelectTopicForDebate,
  onViewResult,
  pastResults
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<TopicCategory>('Technology');

  // Radar chart data for categorical skills
  const radarData = [
    { subject: 'Logic (25%)', value: 88, fullMark: 100 },
    { subject: 'Evidence (20%)', value: 82, fullMark: 100 },
    { subject: 'Rebuttal (20%)', value: 85, fullMark: 100 },
    { subject: 'Clarity (15%)', value: 90, fullMark: 100 },
    { subject: 'Relevance (10%)', value: 92, fullMark: 100 },
    { subject: 'Persuasive (10%)', value: 80, fullMark: 100 }
  ];

  const categoryTopics = stats.mostDebatedByCategory[selectedCategoryTab] || [];
  const currentCategoryInfo = TOPIC_CATEGORIES.find(c => c.id === selectedCategoryTab);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Brain className="w-3.5 h-3.5" />
              <span>Dialectic Training Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Master the Art of Debate with AI Opponents
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Engage multi-agent AI debaters, receive instant logical fallacy alerts, analyze evidence density, and earn comprehensive judicial verdicts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-start-debate-cta"
              onClick={onStartDebate}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
            >
              <Swords className="w-4 h-4" />
              <span>Launch New Debate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Debates */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Debates</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalDebates}</div>
            <p className="text-xs text-slate-400 mt-1">Sessions completed</p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Win Rate</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.winRate}%</div>
            <p className="text-xs text-slate-400 mt-1">{stats.debatesWon} W / {stats.debatesLost} L / {stats.debatesTied} T</p>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Average Score</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stats.averageScore}</div>
            <p className="text-xs text-slate-400 mt-1">Out of 100 points</p>
          </div>
        </div>

        {/* Best Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Score</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-rose-400">{stats.bestScore}</div>
            <p className="text-xs text-slate-400 mt-1">Personal record</p>
          </div>
        </div>

        {/* Active Debater Rank */}
        <div className="col-span-2 lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Rank Tier</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl sm:text-2xl font-bold text-violet-300">Collegiate IV</div>
            <p className="text-xs text-slate-400 mt-1">Top 15% Reasoning</p>
          </div>
        </div>

      </div>

      {/* Analytics Row: Skill Progression Line Chart & Competence Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progression Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Skill Progression Across Debates</span>
              </h2>
              <p className="text-xs text-slate-400">Evolution of logic, evidence, and rebuttal scores over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Overall</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Logic</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Rebuttal</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.skillProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="logic" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="rebuttal" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Radar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span>Rhetorical Balance Radar</span>
            </h2>
            <p className="text-xs text-slate-400">Weighted dialectic dimensions evaluated by AI Judge</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
                <Radar name="Performance" dataKey="value" stroke="#818cf8" fill="#6366f1" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50 flex items-center justify-between">
            <span>Strongest: <strong>Clarity & Relevance</strong></span>
            <span>Focus Area: <strong>Evidence</strong></span>
          </div>
        </div>

      </div>

      {/* FEATURE: CATEGORIZED DEBATE TOPICS DASHBOARD SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
              <BookOpen className="w-3 h-3" />
              <span>Category Exploration</span>
            </div>
            <h2 className="text-xl font-bold text-white">Most Debated Topics by Category</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Analyze motions by domain or launch an instant debate in your favorite category
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {TOPIC_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id.toLowerCase()}`}
                onClick={() => setSelectedCategoryTab(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryTab === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Category Header & Topics Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing trending debate motions under <strong>{currentCategoryInfo?.name}</strong></span>
            <span className="text-indigo-400">{currentCategoryInfo?.description}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTopics.length > 0 ? (
              categoryTopics.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between transition-all group hover:border-indigo-500/40"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {selectedCategoryTab}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {item.count} debates
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white leading-snug">
                      "{item.topic}"
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Ready to challenge?</span>
                    <button
                      id={`debate-topic-btn-${idx}`}
                      onClick={() => onSelectTopicForDebate(item.topic, selectedCategoryTab)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:underline cursor-pointer"
                    >
                      <span>Debate Topic</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-8 text-center text-slate-500 text-sm bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                No recorded debates in this category yet. Be the first to initiate one!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Debates Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Recent Debate Encounters</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">Review full transcripts, fallacy detection logs, and AI judicial reports</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Debate Motion</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Position</th>
                <th className="py-3 px-3">Verdict</th>
                <th className="py-3 px-3">Score (User / AI)</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {stats.recentDebates.map((debate) => {
                const isWin = debate.winner === 'user';
                const isLoss = debate.winner === 'ai';
                return (
                  <tr key={debate.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs sm:max-w-md truncate">
                      {debate.topic}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {debate.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                        debate.userPosition === 'PRO' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {debate.userPosition}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {isWin ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Won
                        </span>
                      ) : isLoss ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                          <XCircle className="w-3.5 h-3.5" /> Lost
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-400">Draw</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-200">
                      <span className={isWin ? 'text-emerald-400' : 'text-slate-300'}>{debate.userScore}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className={isLoss ? 'text-rose-400' : 'text-slate-400'}>{debate.aiScore}</span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-400">
                      {debate.date}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`inspect-debate-btn-${debate.id}`}
                        onClick={() => onViewResult(debate.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition-colors cursor-pointer"
                      >
                        Inspect Result
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
