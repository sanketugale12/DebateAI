import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Calendar, 
  Eye, 
  ArrowRight,
  BookOpen,
  Sparkles,
  Swords
} from 'lucide-react';
import { DebateResult, TopicCategory } from '../types';
import { TOPIC_CATEGORIES } from '../data/topics';

interface HistoryViewProps {
  results: DebateResult[];
  onViewResult: (id: string) => void;
  onStartDebate: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  results,
  onViewResult,
  onStartDebate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [winnerFilter, setWinnerFilter] = useState<'all' | 'user' | 'ai'>('all');

  const filteredResults = results.filter(item => {
    const matchesSearch = item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesWinner = winnerFilter === 'all' || item.winner === winnerFilter;
    return matchesSearch && matchesCat && matchesWinner;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Dialectic Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Debate History & Transcripts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Inspect past arguments, logical fallacy logs, category distributions, and judge assessments
          </p>
        </div>

        <button
          id="history-start-debate-btn"
          onClick={onStartDebate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto transition-colors"
        >
          <Swords className="w-4 h-4" />
          <span>New Debate</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              id="history-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search motions or argument content..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap mr-1">Outcome:</span>
            {(['all', 'user', 'ai'] as const).map(w => (
              <button
                key={w}
                id={`history-filter-outcome-${w}`}
                onClick={() => setWinnerFilter(w)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  winnerFilter === w 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {w === 'all' ? 'All' : w === 'user' ? 'Won' : 'Lost'}
              </button>
            ))}
          </div>

        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800 scrollbar-none">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              categoryFilter === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({results.length})
          </button>

          {TOPIC_CATEGORIES.map(cat => {
            const count = results.filter(r => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          filteredResults.map(item => {
            const isUserWinner = item.winner === 'user';
            const isAiWinner = item.winner === 'ai';

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                      "{item.topic}"
                    </h3>
                  </div>

                  {/* Verdict badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-400">Score (You / AI)</div>
                      <div className="text-sm font-bold">
                        <span className={isUserWinner ? 'text-emerald-400' : 'text-slate-300'}>{item.userScore}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className={isAiWinner ? 'text-rose-400' : 'text-slate-400'}>{item.aiScore}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      isUserWinner 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : isAiWinner
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isUserWinner ? <CheckCircle2 className="w-3.5 h-3.5" /> : isAiWinner ? <XCircle className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
                      <span>{isUserWinner ? 'Won' : isAiWinner ? 'Lost' : 'Tie'}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed italic bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  "{item.reason}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>Your Stance: <strong className="text-slate-200">{item.userPosition}</strong></span>
                    <span>•</span>
                    <span>AI Opponent: <strong className="text-slate-200">{item.aiPosition}</strong></span>
                  </div>

                  <button
                    id={`history-view-eval-btn-${item.id}`}
                    onClick={() => onViewResult(item.id)}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer group-hover:underline"
                  >
                    <span>Inspect Verdict</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
            <History className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-300">No matching debates found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing your search query or selecting a different category filter.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
