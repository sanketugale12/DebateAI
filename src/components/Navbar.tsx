import React from 'react';
import { 
  MessageSquare, 
  Shield, 
  PlusCircle, 
  LayoutGrid, 
  History as HistoryIcon, 
  Sun, 
  LogOut,
  LogIn,
  Swords,
  User as UserIcon
} from 'lucide-react';
import { User, AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: User;
  hasActiveDebate: boolean;
  onResetSession?: () => void;
  onSignOut?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  hasActiveDebate,
  onResetSession,
  onSignOut,
  onOpenAuth
}) => {
  const userInitial = (user?.name ? user.name.charAt(0) : 'D').toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[#070a16]/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo & Platform Identity */}
        <div 
          id="nav-brand"
          onClick={() => onNavigate('chat')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {/* Logo icon: vibrant purple/magenta square with chat glyph */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9333ea] via-[#7c3aed] to-[#ec4899] flex items-center justify-center shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform shrink-0">
            <div className="w-5 h-5 rounded-md border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-xs"></div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">DebateAI</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#161f42] border border-[#27376c] text-[#60a5fa] flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#60a5fa]" />
                <span>CHATBOT</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
              Conversational AI Debate Assistant & Sparring Partner
            </p>
          </div>
        </div>

        {/* Center: Pill Navigation Dock */}
        <div className="hidden md:flex items-center bg-[#0c1022] border border-slate-800 rounded-xl p-1 gap-1 shadow-inner">
          {/* Chatbot Tab (ChatGPT-style) */}
          <button
            id="nav-tab-chatbot"
            onClick={() => onNavigate('chat')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'chat'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chatbot</span>
          </button>

          {/* Parliamentary Arena Tab */}
          <button
            id="nav-tab-setup"
            onClick={() => onNavigate('setup')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'setup' || currentView === 'debate'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Formal Arena</span>
          </button>

          <button
            id="nav-tab-dashboard"
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-history"
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'history'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            id="nav-tab-profile"
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'profile'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* Right: Theme Toggle + Sign In / User Chip + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sign In button if not in auth view */}
          {currentView !== 'auth' && (
            <button
              type="button"
              id="nav-signin-btn"
              onClick={() => {
                if (onOpenAuth) onOpenAuth('login');
                else onNavigate('auth');
              }}
              title="Sign In / Register Debater Account"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141a38] hover:bg-[#1c244f] border border-[#27356c] text-indigo-300 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user?.isAuthenticated ? 'Account' : 'Sign In'}</span>
            </button>
          )}

          {/* Theme Icon Button (Sun for dark mode) */}
          <button
            type="button"
            id="theme-toggle-btn"
            title="Toggle theme"
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* User Profile Chip */}
          <div 
            id="nav-user-chip"
            onClick={() => onNavigate('profile')}
            title="View Profile"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
              currentView === 'profile'
                ? 'bg-indigo-600/20 border border-indigo-500/50 ring-1 ring-indigo-500/30 text-white'
                : 'bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-200'
            }`}
          >
            <div className="w-5 h-5 rounded bg-[#4f46e5] flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
              {userInitial}
            </div>
            <span className="text-xs font-medium hidden sm:inline max-w-[110px] truncate">
              {user?.name || 'Demo Debater'}
            </span>
          </div>

          {/* Logout / Exit icon button */}
          <button
            type="button"
            id="nav-logout-btn"
            onClick={() => {
              if (onSignOut) {
                onSignOut();
              } else {
                if (onResetSession) onResetSession();
                onNavigate('auth');
              }
            }}
            title={user?.isAuthenticated ? 'Sign Out & Return to Login' : 'Exit / Reset Session'}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
