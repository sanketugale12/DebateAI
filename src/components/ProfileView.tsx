import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Trophy, 
  Award, 
  Bell, 
  Globe, 
  Check, 
  Save, 
  Sparkles, 
  Database, 
  Github, 
  Trash2, 
  Download, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
  LogIn,
  LogOut,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';
import { User, DashboardStats, AppView } from '../types';

interface ProfileViewProps {
  user: User;
  stats: DashboardStats;
  onUpdateUser: (updated: User) => void;
  onExportData: () => void;
  onResetStats: () => void;
  onSignOut?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onNavigate?: (view: AppView) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80'
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  onUpdateUser,
  onExportData,
  onResetStats,
  onSignOut,
  onOpenAuth,
  onNavigate
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');
  const [role, setRole] = useState(user.role || 'Competitive Debater (Rank 14)');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  const [notifications, setNotifications] = useState(user.notificationPreferences);
  const [linkedAccounts, setLinkedAccounts] = useState(user.linkedAccounts);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Sync state whenever the user prop changes (e.g. login / account switch)
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setBio(user.bio || '');
    setRole(user.role || 'Competitive Debater (Rank 14)');
    setAvatarUrl(user.avatarUrl);
    setNotifications(user.notificationPreferences);
    setLinkedAccounts(user.linkedAccounts);
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name,
      email,
      bio,
      role,
      avatarUrl,
      notificationPreferences: notifications,
      linkedAccounts
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleLinkedAccount = (provider: 'github' | 'google' | 'discord' | 'supabase') => {
    setLinkedAccounts(prev => {
      const current = prev[provider];
      return {
        ...prev,
        [provider]: {
          connected: !current?.connected,
          username: !current?.connected ? `${name.toLowerCase().replace(/\s+/g, '_')}` : undefined,
          email: !current?.connected ? email : undefined
        }
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <UserIcon className="w-3.5 h-3.5" />
          <span>Account & Rhetorical Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Manage your personal details, avatar, dialectic track record, notification preferences, and external integrations.
        </p>

        {/* Quick Navigation Pills */}
        {onNavigate && (
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            <button
              type="button"
              id="profile-nav-setup"
              onClick={() => onNavigate('setup')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Start New Debate</span>
            </button>
            <button
              type="button"
              id="profile-nav-dashboard"
              onClick={() => onNavigate('dashboard')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Analytics</span>
            </button>
            <button
              type="button"
              id="profile-nav-history"
              onClick={() => onNavigate('history')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Debate History</span>
            </button>
          </div>
        )}
      </div>

      {/* OVERALL DEBATE STATISTICS CARD (Per User Request) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Overall Debate Performance Summary</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {role}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Total Debates</span>
            <span className="text-xl font-bold text-white mt-1 block">{stats.totalDebates}</span>
          </div>

          {/* Wins */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Wins</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">{stats.debatesWon}</span>
          </div>

          {/* Losses */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Losses</span>
            <span className="text-xl font-bold text-rose-400 mt-1 block">{stats.debatesLost}</span>
          </div>

          {/* Win Rate */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Win Rate</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">{stats.winRate}%</span>
          </div>

          {/* Average Score */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Average Score</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{stats.averageScore}</span>
          </div>

          {/* Best Score */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Best Score</span>
            <span className="text-xl font-bold text-rose-400 mt-1 block">{stats.bestScore}</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: User Identity & Avatar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>Identity & Avatar</span>
            </h2>
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Changes saved successfully!</span>
              </span>
            )}
          </div>

          {/* Avatar Preview & Presets */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <img 
                src={avatarUrl} 
                alt={name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1 text-white shadow">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <span className="text-xs font-semibold text-slate-300">Choose an Avatar Preset</span>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    id={`avatar-preset-${idx}`}
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform cursor-pointer ${
                      avatarUrl === preset ? 'border-indigo-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="pt-1">
                <input 
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or enter custom image URL"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username / Display Name</label>
              <input 
                id="profile-name-input"
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input 
                id="profile-email-input"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Bio & Philosophy */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Rhetorical Philosophy & Bio</label>
            <textarea 
              id="profile-bio-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your debate style, favorite motions, and dialectic goals..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

        </div>

        {/* Section 2: Notification Preferences */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Notification & Audio Preferences</span>
            </h2>
            <span className="text-xs text-slate-400">Custom alert triggers</span>
          </div>

          <div className="divide-y divide-slate-800/60 text-sm">
            
            {/* Debate Reminders */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-xs sm:text-sm">Debate Reminders & Turn Pings</div>
                <div className="text-xs text-slate-400">Receive notifications when your scheduled debate turns are pending</div>
              </div>
              <input 
                type="checkbox"
                id="pref-debate-reminders"
                checked={notifications.debateReminders}
                onChange={(e) => setNotifications(prev => ({ ...prev, debateReminders: e.target.checked }))}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Daily Logic Tips */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-xs sm:text-sm">Daily Logic & Fallacy Drill</div>
                <div className="text-xs text-slate-400">Short daily micro-challenges to detect straw man, ad hominem, and circular claims</div>
              </div>
              <input 
                type="checkbox"
                id="pref-daily-logic"
                checked={notifications.dailyLogicTips}
                onChange={(e) => setNotifications(prev => ({ ...prev, dailyLogicTips: e.target.checked }))}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Challenge Alerts */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-xs sm:text-sm">Weekly Topic Challenges</div>
                <div className="text-xs text-slate-400">Notify when high-profile contentious motions are published</div>
              </div>
              <input 
                type="checkbox"
                id="pref-challenge-alerts"
                checked={notifications.challengeAlerts}
                onChange={(e) => setNotifications(prev => ({ ...prev, challengeAlerts: e.target.checked }))}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Email Summaries */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-xs sm:text-sm">Performance Digest via Email</div>
                <div className="text-xs text-slate-400">Weekly analytical scorecard including areas for improvement</div>
              </div>
              <input 
                type="checkbox"
                id="pref-email-summaries"
                checked={notifications.emailSummaries}
                onChange={(e) => setNotifications(prev => ({ ...prev, emailSummaries: e.target.checked }))}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Sound Effects */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-xs sm:text-sm">Debate Gavel Sound Effects</div>
                <div className="text-xs text-slate-400">Play subtle audio cues during round transitions and victory verdicts</div>
              </div>
              <input 
                type="checkbox"
                id="pref-sound-effects"
                checked={notifications.soundEffects}
                onChange={(e) => setNotifications(prev => ({ ...prev, soundEffects: e.target.checked }))}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Section 3: Linked External Accounts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Linked Accounts & Cloud Sync</span>
            </h2>
            <span className="text-xs text-slate-400">OAuth & External storage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* GitHub */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700 text-white">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">GitHub</div>
                  <div className="text-[11px] text-slate-400">
                    {linkedAccounts.github?.connected ? `@${linkedAccounts.github.username}` : 'Not linked'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                id="link-github-btn"
                onClick={() => toggleLinkedAccount('github')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  linkedAccounts.github?.connected 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {linkedAccounts.github?.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Google */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700 text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Google Account</div>
                  <div className="text-[11px] text-slate-400">
                    {linkedAccounts.google?.connected ? linkedAccounts.google.email : 'Not linked'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                id="link-google-btn"
                onClick={() => toggleLinkedAccount('google')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  linkedAccounts.google?.connected 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {linkedAccounts.google?.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Supabase / PostgreSQL */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Supabase / PostgreSQL</div>
                  <div className="text-[11px] text-slate-400">
                    {linkedAccounts.supabase?.connected ? 'Cloud Database Connected' : 'Local Storage Mode'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                id="link-supabase-btn"
                onClick={() => toggleLinkedAccount('supabase')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  linkedAccounts.supabase?.connected 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {linkedAccounts.supabase?.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Discord */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Discord Community</div>
                  <div className="text-[11px] text-slate-400">
                    {linkedAccounts.discord?.connected ? `@${linkedAccounts.discord.username}` : 'Not linked'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                id="link-discord-btn"
                onClick={() => toggleLinkedAccount('discord')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  linkedAccounts.discord?.connected 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {linkedAccounts.discord?.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

          </div>
        </div>

        {/* Section 4: Data Management & Export */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Data Export & Reset</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-xs text-slate-400 text-center sm:text-left">
              <div>Download your complete dialectic history, transcripts, and evaluation scorecards as JSON.</div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="profile-export-data-btn"
                onClick={onExportData}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors w-full sm:w-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Debate JSON</span>
              </button>

              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-medium">Clear all records?</span>
                  <button
                    type="button"
                    id="profile-confirm-reset-btn"
                    onClick={() => {
                      onResetStats();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    id="profile-cancel-reset-btn"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="profile-reset-stats-btn"
                  onClick={() => setConfirmReset(true)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-300 flex items-center justify-center gap-2 cursor-pointer transition-colors w-full sm:w-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Stats</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Account & Authentication */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Authentication & Session</span>
            </h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.isAuthenticated ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-amber-950/80 border border-amber-800 text-amber-300'}`}>
              {user.isAuthenticated ? 'Authenticated Account' : 'Guest / Demo Mode'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 space-y-1 text-center sm:text-left">
              <div>
                Currently logged in as <strong className="text-white">{user.name}</strong> ({user.email}).
              </div>
              <div className="text-[11px] text-slate-400">
                You can switch debater accounts or reset your security password at any time.
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                id="profile-switch-account-btn"
                onClick={() => onOpenAuth ? onOpenAuth('login') : null}
                className="px-3.5 py-2 bg-[#121838] hover:bg-[#192250] border border-[#232f6a] rounded-xl text-xs font-semibold text-indigo-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors flex-1 sm:flex-initial"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Switch / Sign In</span>
              </button>

              <button
                type="button"
                id="profile-signout-btn"
                onClick={() => onSignOut ? onSignOut() : null}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors flex-1 sm:flex-initial"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            id="profile-save-btn"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Preferences</span>
          </button>
        </div>

      </form>

    </div>
  );
};
