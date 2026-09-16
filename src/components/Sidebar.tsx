import React from 'react';
import { 
  PlusCircle, 
  LayoutDashboard, 
  History, 
  Bot, 
  Cpu,
  LogIn,
  UserCheck,
  User as UserIcon
} from 'lucide-react';
import { User, AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: User;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth
}) => {
  const userInitial = (user?.name ? user.name.charAt(0) : 'D').toUpperCase();

  return (
    <aside className="w-64 shrink-0 bg-[#060812] border-r border-slate-800/80 p-4 hidden md:flex flex-col justify-between min-h-[calc(100vh-64px)] select-none">
      
      {/* Top: Navigation List */}
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
            NAVIGATION
          </div>

          <div className="space-y-1.5">
            {/* New Debate Button */}
            <button
              id="sidebar-nav-new-debate"
              onClick={() => onNavigate('setup')}
              className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'setup'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>New Debate</span>
            </button>

            {/* Dashboard Button */}
            <button
              id="sidebar-nav-dashboard"
              onClick={() => onNavigate('dashboard')}
              className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </button>

            {/* Debate History Button */}
            <button
              id="sidebar-nav-history"
              onClick={() => onNavigate('history')}
              className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'history'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Debate History</span>
            </button>

            {/* Profile Button */}
            <button
              id="sidebar-nav-profile"
              onClick={() => onNavigate('profile')}
              className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>

            {/* Sign In / Account Button */}
            <button
              id="sidebar-nav-auth"
              onClick={() => {
                if (onOpenAuth) onOpenAuth('login');
                else onNavigate('auth');
              }}
              className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'auth'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>{user?.isAuthenticated ? 'Account Portal' : 'Login / Sign In'}</span>
            </button>
          </div>
        </div>

        {/* AI Multi-Agent System Card (matching screenshot) */}
        <div className="bg-gradient-to-b from-[#10142b]/90 to-[#0b0e20]/90 border border-indigo-950/70 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>AI Multi-Agent System</span>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            DebateAI deploys 4 specialized AI agents: Opponent, Analyzer, Fallacy Detector, and AI Judge.
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Opponent: Active</span>
            <span className="text-emerald-400 font-semibold">Judge: Impartial</span>
          </div>
        </div>
      </div>

      {/* Bottom: User Profile Card */}
      <div 
        id="sidebar-user-card"
        onClick={() => onNavigate('profile')}
        className={`border rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-colors mt-6 ${
          currentView === 'profile'
            ? 'bg-[#151c45] border-indigo-500/60 shadow-lg shadow-indigo-600/10'
            : 'bg-[#0c1024] hover:bg-[#101530] border-slate-800/80'
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0">
          {userInitial}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-white truncate">
            {user.name || 'Demo Debater'}
          </span>
          <span className="text-[11px] text-slate-400 truncate">
            {user.email || 'demo@debateai.org'}
          </span>
        </div>
      </div>

    </aside>
  );
};
