import React from 'react';
import { 
  Trophy, 
  Brain, 
  BookOpen, 
  RefreshCw, 
  MessageSquare, 
  Target, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Download, 
  Swords,
  Scale,
  Sparkles,
  Share2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { DebateResult } from '../types';

interface ResultsViewProps {
  result: DebateResult;
  onNewDebate: () => void;
  onViewDashboard: () => void;
  onViewTranscript: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onNewDebate,
  onViewDashboard,
  onViewTranscript
}) => {
  const isUserWinner = result.winner === 'user';
  const isAiWinner = result.winner === 'ai';

  // Category chart comparison data
  const comparisonData = [
    { 
      category: 'Logic (25)', 
      User: result.userCategoryScores.logicalReasoning, 
      AI: result.aiCategoryScores.logicalReasoning, 
      max: 25 
    },
    { 
      category: 'Evidence (20)', 
      User: result.userCategoryScores.evidence, 
      AI: result.aiCategoryScores.evidence, 
      max: 20 
    },
    { 
      category: 'Rebuttal (20)', 
      User: result.userCategoryScores.rebuttalQuality, 
      AI: result.aiCategoryScores.rebuttalQuality, 
      max: 20 
    },
    { 
      category: 'Clarity (15)', 
      User: result.userCategoryScores.clarity, 
      AI: result.aiCategoryScores.clarity, 
      max: 15 
    },
    { 
      category: 'Relevance (10)', 
      User: result.userCategoryScores.relevance, 
      AI: result.aiCategoryScores.relevance, 
      max: 10 
    },
    { 
      category: 'Persuasion (10)', 
      User: result.userCategoryScores.persuasiveness, 
      AI: result.aiCategoryScores.persuasiveness, 
      max: 10 
    }
  ];

  const downloadEvaluation = () => {
    const content = `DEBATE EVALUATION REPORT
==================================================
Topic: ${result.topic}
Category: ${result.category}
User Position: ${result.userPosition}
AI Opponent Position: ${result.aiPosition}
Date: ${new Date(result.createdAt).toLocaleString()}

FINAL RESULT
Winner: ${result.winner.toUpperCase()}
User Score: ${result.userScore}/100
AI Score: ${result.aiScore}/100

JUDGE RATIONALE:
${result.reason}

CATEGORY SCORES (USER / AI):
- Logical Reasoning: ${result.userCategoryScores.logicalReasoning} / ${result.aiCategoryScores.logicalReasoning} (Max 25)
- Evidence: ${result.userCategoryScores.evidence} / ${result.aiCategoryScores.evidence} (Max 20)
- Rebuttal Quality: ${result.userCategoryScores.rebuttalQuality} / ${result.aiCategoryScores.rebuttalQuality} (Max 20)
- Clarity: ${result.userCategoryScores.clarity} / ${result.aiCategoryScores.clarity} (Max 15)
- Relevance: ${result.userCategoryScores.relevance} / ${result.aiCategoryScores.relevance} (Max 10)
- Persuasiveness: ${result.userCategoryScores.persuasiveness} / ${result.aiCategoryScores.persuasiveness} (Max 10)

STRONGEST ARGUMENT:
"${result.strongestArgument.quote}"
Analysis: ${result.strongestArgument.analysis}

WEAKEST ARGUMENT:
"${result.weakestArgument.quote}"
Analysis: ${result.weakestArgument.analysis}

BEST REBUTTAL:
"${result.bestRebuttal.quote}"
Analysis: ${result.bestRebuttal.analysis}

FALLACIES DETECTED:
${result.detectedFallaciesSummary.join('\n')}

IMPROVEMENT SUGGESTIONS:
${result.improvementSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debate-result-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Banner: Winner & Scores */}
      <div className={`rounded-2xl p-6 sm:p-8 border shadow-xl relative overflow-hidden ${
        isUserWinner
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-emerald-500/40'
          : isAiWinner
          ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border-rose-500/40'
          : 'bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border-amber-500/40'
      }`}>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-200">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Official AI Judge Adjudication</span>
              <span>•</span>
              <span className="text-indigo-400">{result.category}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Official Resolution
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                "{result.topic}"
              </h1>
            </div>

            {/* Verdict Announcement */}
            <div className="flex items-center gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Judicial Verdict</div>
                <div className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  {isUserWinner ? (
                    <span className="text-emerald-400">Victory: User Preserves Burden</span>
                  ) : isAiWinner ? (
                    <span className="text-rose-400">Opposition Carries Motion (AI)</span>
                  ) : (
                    <span className="text-amber-400">Inconclusive Dialectic (Draw)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Judicial reason */}
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed italic pt-1">
              "{result.reason}"
            </p>
          </div>

          {/* Comparative Score Cards */}
          <div className="flex items-center gap-4 shrink-0">
            {/* User score */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-center min-w-[120px] shadow-lg">
              <div className="text-xs font-semibold text-slate-400">You ({result.userPosition})</div>
              <div className={`text-3xl sm:text-4xl font-extrabold mt-1 ${isUserWinner ? 'text-emerald-400' : 'text-slate-200'}`}>
                {result.userScore}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">/ 100 points</div>
            </div>

            <div className="text-slate-500 font-bold text-lg">vs</div>

            {/* AI score */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-center min-w-[120px] shadow-lg">
              <div className="text-xs font-semibold text-slate-400">AI Opponent ({result.aiPosition})</div>
              <div className={`text-3xl sm:text-4xl font-extrabold mt-1 ${isAiWinner ? 'text-rose-400' : 'text-slate-200'}`}>
                {result.aiScore}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">/ 100 points</div>
            </div>
          </div>

        </div>

      </div>

      {/* Category Performance Breakdown Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <span>Standardized 100-Point Category Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400">
              Scored on Logical Reasoning (25%), Evidence (20%), Rebuttal (20%), Clarity (15%), Relevance (10%), Persuasiveness (10%)
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 25]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="User" fill="#6366f1" radius={[4, 4, 0, 0]} name="Your Score" />
              <Bar dataKey="AI" fill="#f59e0b" radius={[4, 4, 0, 0]} name="AI Opponent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deep Qualitative Review Cards: Strongest, Weakest, Best Rebuttal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Strongest Argument */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Strongest Argument</span>
            </div>
            <p className="text-xs text-slate-300 italic bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              "{result.strongestArgument.quote}"
            </p>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-snug">
            <strong>Judge Commentary:</strong> {result.strongestArgument.analysis}
          </p>
        </div>

        {/* Weakest Argument */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Vulnerable Point</span>
            </div>
            <p className="text-xs text-slate-300 italic bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              "{result.weakestArgument.quote}"
            </p>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-snug">
            <strong>Judge Commentary:</strong> {result.weakestArgument.analysis}
          </p>
        </div>

        {/* Best Rebuttal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Swords className="w-4 h-4" />
              <span>Pivotal Rebuttal</span>
            </div>
            <p className="text-xs text-slate-300 italic bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              "{result.bestRebuttal.quote}"
            </p>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-snug">
            <strong>Judge Commentary:</strong> {result.bestRebuttal.analysis}
          </p>
        </div>

      </div>

      {/* Fallacy Log & Qualitative Coaching */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fallacies Audited */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Logical Fallacies Audit Log</span>
          </h3>
          <div className="space-y-2">
            {result.detectedFallaciesSummary.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 leading-relaxed"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Improvement Suggestions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Targeted Training Recommendations</span>
          </h3>
          <div className="space-y-2">
            {result.improvementSuggestions.map((sug, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-200 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{sug}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          id="results-back-dashboard-btn"
          onClick={onViewDashboard}
          className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="results-view-transcript-btn"
            onClick={onViewTranscript}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors border border-slate-700"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Read Full Transcript</span>
          </button>

          <button
            id="results-download-report-btn"
            onClick={downloadEvaluation}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (.txt)</span>
          </button>

          <button
            id="results-debate-again-btn"
            onClick={onNewDebate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer transition-transform hover:scale-102"
          >
            <Swords className="w-4 h-4" />
            <span>New Debate Motion</span>
          </button>
        </div>
      </div>

    </div>
  );
};
