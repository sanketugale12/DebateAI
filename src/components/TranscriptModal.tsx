import React from 'react';
import { 
  X, 
  Download, 
  Trophy, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  User as UserIcon, 
  Bot,
  Brain,
  MessageSquare
} from 'lucide-react';
import { DebateResult, DebateMessage } from '../types';

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DebateResult;
  messages?: DebateMessage[];
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  isOpen,
  onClose,
  result,
  messages = []
}) => {
  if (!isOpen) return null;

  const isUserWinner = result.winner === 'user';
  const isAiWinner = result.winner === 'ai';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {result.category}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(result.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
              "{result.topic}"
            </h2>
          </div>

          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Adjudication Quick Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Final Outcome</div>
                <div className="text-sm font-bold text-white">
                  {isUserWinner ? 'User Carried the Motion' : isAiWinner ? 'AI Opposition Prevailed' : 'Tie / Split Decision'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-[11px] text-slate-400">Scores</div>
                <div className="text-sm font-bold">
                  <span className={isUserWinner ? 'text-emerald-400' : 'text-slate-200'}>{result.userScore}</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className={isAiWinner ? 'text-rose-400' : 'text-slate-400'}>{result.aiScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Dialogue */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Full Round-by-Round Transcript</span>
            </h3>

            {messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((m, idx) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-100 ml-4' 
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          {isUser ? <UserIcon className="w-3.5 h-3.5 text-indigo-400" /> : <Bot className="w-3.5 h-3.5 text-amber-400" />}
                          {isUser ? 'You' : 'AI Opponent'}
                        </span>
                        <span className="text-[11px] text-indigo-400">{m.phaseName} (Round {m.roundNumber})</span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-700 text-xs text-slate-400 text-center">
                Detailed dialogue archived with primary analysis logs.
              </div>
            )}
          </div>

          {/* Judicial Review */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Judge Rationale & Takeaways</span>
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 italic bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
              "{result.reason}"
            </p>

            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-400">Improvement Focus:</div>
              {result.improvementSuggestions.map((sug, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
