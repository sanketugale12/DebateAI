import React from 'react';
import { 
  PlusCircle, 
  LayoutDashboard, 
  History, 
  Bot, 
  Cpu,
  LogIn,
  UserCheck,
  User as UserIcon,
  MessageSquare,
  Sparkles,
  Swords,
  Trash2
} from 'lucide-react';
import { User, AppView, ChatConversation } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: User;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  conversations?: ChatConversation[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
  onDeleteConversation?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) => {
  const userInitial = (user?.name ? user.name.charAt(0) : 'D').toUpperCase();

  return (
    <aside className="w-64 shrink-0 bg-[#060812] border-r border-slate-800/80 p-4 hidden md:flex flex-col justify-between min-h-[calc(100vh-64px)] select-none">
      
      {/* Top: Navigation List + Recent Chats */}
      <div className="space-y-6 overflow-hidden flex flex-col flex-1">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2.5">
            PLATFORM
          </div>

          <div className="space-y-1">
            {/* Debate Chatbot (ChatGPT style) */}
            <button
              id="sidebar-nav-chatbot"
              onClick={() => onNavigate('chat')}
              className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'chat'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Debate Chatbot</span>
              <span className="ml-auto text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                AI
              </span>
            </button>

            {/* Parliamentary Arena */}
            <button
              id="sidebar-nav-arena"
              onClick={() => onNavigate('setup')}
              className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'setup' || currentView === 'debate'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Swords className="w-4 h-4 text-slate-400" />
              <span>Formal Arena</span>
            </button>

            {/* Dashboard Button */}
            <button
              id="sidebar-nav-dashboard"
              onClick={() => onNavigate('dashboard')}
              className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Analytics</span>
            </button>

            {/* Debate History Button */}
            <button
              id="sidebar-nav-history"
              onClick={() => onNavigate('history')}
              className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'history'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Transcripts</span>
            </button>

            {/* Profile Button */}
            <button
              id="sidebar-nav-profile"
              onClick={() => onNavigate('profile')}
              className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* ChatGPT-style Recent Conversations List */}
        <div className="flex-1 flex flex-col min-h-0 border-t border-slate-800/80 pt-3">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              RECENT DEBATES
            </span>
            {onNewConversation && (
              <button
                type="button"
                onClick={() => {
                  onNewConversation();
                  onNavigate('chat');
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                title="New Chat"
              >
                + New
              </button>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto pr-1 flex-1">
            {conversations.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No recent debates yet. Start a chat above!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = currentView === 'chat' && conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      if (onSelectConversation) onSelectConversation(conv.id);
                      onNavigate('chat');
                    }}
                    className={`group w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{conv.title || 'Untitled Debate'}</span>
                    </div>

                    {onDeleteConversation && conversations.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity cursor-pointer"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Bottom: User Card */}
      <div className="pt-4 border-t border-slate-800/80">
        <div 
          onClick={() => onNavigate('profile')}
          className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user.role || 'Active Debater'}</div>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};
