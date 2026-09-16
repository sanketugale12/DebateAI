import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  GraduationCap,
  Scale,
  Zap,
  Globe
} from 'lucide-react';
import { User, AuthMode } from '../types';
import { authApi } from '../services/apiClient';

interface AuthViewProps {
  initialMode?: AuthMode;
  onLoginSuccess: (user: User) => void;
  onCancel: () => void;
}

interface StoredAccount {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  avatarUrl: string;
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    name: 'Demo Debater',
    email: 'demo@debateai.org',
    passwordHash: 'password123',
    role: 'Competitive Debater (Rank 14)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sarah Jenkins',
    email: 'sarah.debater@gmail.com',
    passwordHash: 'collegiate2026',
    role: 'Varsity Policy Debater (Rank 4)',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
  }
];

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onCancel
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [debaterLevel, setDebaterLevel] = useState<'Novice' | 'Collegiate' | 'Advanced'>('Collegiate');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password flow
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string>('482910');

  // UI status
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load registered accounts from localStorage
  const getRegisteredAccounts = (): StoredAccount[] => {
    try {
      const saved = localStorage.getItem('debateai_registered_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACCOUNTS;
  };

  const saveRegisteredAccounts = (accounts: StoredAccount[]) => {
    try {
      localStorage.setItem('debateai_registered_accounts', JSON.stringify(accounts));
    } catch {
      // ignore
    }
  };

  // Switch tabs cleanly
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setResetStep(1);
  };

  // Quick Demo Account Auto-Fill
  const handleQuickDemoFill = (acc: StoredAccount) => {
    setEmail(acc.email);
    setPassword(acc.passwordHash);
    setErrorMsg(null);
  };

  // Handle Sign In / Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with Axios backend (JWT + password verification)
      const res = await authApi.login(email.trim(), password);
      if (res.user) {
        setIsLoading(false);
        setSuccessMsg(`Welcome back, ${res.user.name}! (JWT Authenticated)`);
        setTimeout(() => onLoginSuccess(res.user), 400);
        return;
      }
    } catch (apiErr: any) {
      console.warn('Axios auth fallback to local credentials:', apiErr?.message);
    }

    // Fallback authentication
    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      const existing = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      // Authenticate
      if (existing) {
        if (existing.passwordHash && existing.passwordHash !== password) {
          setIsLoading(false);
          setErrorMsg('Incorrect password. Please try again or use "Forgot Password".');
          return;
        }

        const authenticatedUser: User = {
          id: `user-${Date.now()}`,
          name: existing.name,
          email: existing.email,
          createdAt: '2026-01-15',
          avatarUrl: existing.avatarUrl,
          bio: 'Debater on DebateAI honing logic, rhetoric, and rebuttal skills.',
          role: existing.role,
          isAuthenticated: true,
          notificationPreferences: {
            debateReminders: true,
            dailyLogicTips: true,
            challengeAlerts: true,
            emailSummaries: false,
            soundEffects: true
          },
          linkedAccounts: {
            github: { connected: false },
            google: { connected: true, email: existing.email }
          }
        };

        setIsLoading(false);
        setSuccessMsg(`Welcome back, ${existing.name}!`);
        setTimeout(() => onLoginSuccess(authenticatedUser), 400);
      } else {
        // Allow sign-in by auto-creating session if user typed something valid
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].replace(/[._-]/g, ' ') || 'Debater',
          email: email.trim(),
          createdAt: new Date().toISOString().split('T')[0],
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          bio: 'Debater on DebateAI platform.',
          role: 'Active Debater',
          isAuthenticated: true,
          notificationPreferences: {
            debateReminders: true,
            dailyLogicTips: true,
            challengeAlerts: true,
            emailSummaries: false,
            soundEffects: true
          },
          linkedAccounts: {
            google: { connected: false }
          }
        };

        // Register new account
        accounts.push({
          name: newUser.name,
          email: newUser.email,
          passwordHash: password,
          role: newUser.role || 'Debater',
          avatarUrl: newUser.avatarUrl
        });
        saveRegisteredAccounts(accounts);

        setIsLoading(false);
        setSuccessMsg('Account authorized successfully!');
        setTimeout(() => onLoginSuccess(newUser), 400);
      }
    }, 500);
  };

  // Handle Sign Up / Register
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name or debate alias.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the DebateAI community fair-play terms.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.register(name.trim(), email.trim(), password, debaterLevel);
      if (res.user) {
        setIsLoading(false);
        setSuccessMsg(`Welcome to DebateAI, ${res.user.name}! (Account created with JWT)`);
        setTimeout(() => onLoginSuccess(res.user), 400);
        return;
      }
    } catch (apiErr: any) {
      console.warn('Axios register fallback to local state:', apiErr?.message);
    }

    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      const existing = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existing) {
        setIsLoading(false);
        setErrorMsg('An account with this email already exists. Please Sign In.');
        return;
      }

      const roleStr = 
        debaterLevel === 'Novice' ? 'Beginner Debater (Rank 1)' :
        debaterLevel === 'Collegiate' ? 'Collegiate Debater (Rank 10)' :
        'Varsity Policy Specialist (Rank 25)';

      const createdUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        bio: `${debaterLevel} debater dedicated to objective dialectics and evidence-based argumentation.`,
        role: roleStr,
        isAuthenticated: true,
        notificationPreferences: {
          debateReminders: true,
          dailyLogicTips: true,
          challengeAlerts: true,
          emailSummaries: true,
          soundEffects: true
        },
        linkedAccounts: {}
      };

      accounts.push({
        name: createdUser.name,
        email: createdUser.email,
        passwordHash: password,
        role: roleStr,
        avatarUrl: createdUser.avatarUrl
      });
      saveRegisteredAccounts(accounts);

      setIsLoading(false);
      setSuccessMsg(`Welcome to DebateAI, ${createdUser.name}! Initializing your profile...`);
      setTimeout(() => onLoginSuccess(createdUser), 500);
    }, 500);
  };

  // Handle Forgot Password - Step 1: Request Code
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res.code) {
        setGeneratedCode(res.code);
        setResetCode(res.code);
        setIsLoading(false);
        setResetStep(2);
        setSuccessMsg(res.message || `Password reset verification code dispatched to ${email.trim()}.`);
        return;
      }
    } catch (e: any) {
      console.warn('Axios forgot-password fallback:', e?.message);
    }

    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setResetCode(code); // Prepopulate for smooth demo testing
      setIsLoading(false);
      setResetStep(2);
      setSuccessMsg(`Password reset verification code dispatched to ${email.trim()}.`);
    }, 500);
  };

  // Handle Forgot Password - Step 2: Set New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetCode.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match. Please ensure both fields match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword(email.trim(), resetCode.trim(), newPassword);
      if (res.status === 'success') {
        setIsLoading(false);
        setSuccessMsg('Your password has been successfully reset! You can now sign in.');
        setPassword(newPassword);
        setTimeout(() => {
          setMode('login');
        }, 1000);
        return;
      }
    } catch (e: any) {
      console.warn('Axios reset-password fallback:', e?.message);
    }

    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      const userIndex = accounts.findIndex(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (userIndex !== -1) {
        accounts[userIndex].passwordHash = newPassword;
        saveRegisteredAccounts(accounts);
      }

      setIsLoading(false);
      setSuccessMsg('Your password has been successfully reset! You can now sign in.');
      setPassword(newPassword);
      setTimeout(() => {
        setMode('login');
      }, 1000);
    }, 500);
  };

  // Social Auth Handler
  const handleSocialLogin = (provider: 'Google' | 'GitHub') => {
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const socialUser: User = {
        id: `social-${provider.toLowerCase()}-${Date.now()}`,
        name: provider === 'Google' ? 'Google Debater' : 'Octo Debater',
        email: provider === 'Google' ? 'google.debater@gmail.com' : 'octo.debater@github.com',
        createdAt: new Date().toISOString().split('T')[0],
        avatarUrl: provider === 'Google' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
        bio: `Authenticated via ${provider} Single Sign-On. Ready for competitive debates.`,
        role: 'Verified Debater',
        isAuthenticated: true,
        notificationPreferences: {
          debateReminders: true,
          dailyLogicTips: true,
          challengeAlerts: true,
          emailSummaries: false,
          soundEffects: true
        },
        linkedAccounts: {
          [provider.toLowerCase()]: { connected: true, email: `${provider.toLowerCase()}@user.com` }
        }
      };

      setIsLoading(false);
      setSuccessMsg(`Signed in with ${provider}!`);
      setTimeout(() => onLoginSuccess(socialUser), 400);
    }, 500);
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex items-center justify-center p-3 sm:p-6 select-none">
      
      {/* Auth Card Container */}
      <div className="max-w-md w-full bg-[#0a0e20]/95 border border-[#1b223d] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-xl">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Mode Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9333ea] via-[#7c3aed] to-[#ec4899] shadow-lg shadow-purple-900/40 mb-1">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {mode === 'login' && 'Sign in to DebateAI'}
            {mode === 'signup' && 'Create Your Debater Account'}
            {mode === 'forgot-password' && 'Reset Your Password'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400">
            {mode === 'login' && 'Enter your credentials to access your debate record and rankings.'}
            {mode === 'signup' && 'Join the competitive AI arena to sharpen rhetoric and dialectics.'}
            {mode === 'forgot-password' && 'We will help you recover access to your debate profile.'}
          </p>
        </div>

        {/* Tab Switcher (Only between Login and Sign Up) */}
        {mode !== 'forgot-password' && (
          <div className="grid grid-cols-2 p-1 bg-[#060815] border border-[#171e3b] rounded-xl relative z-10">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => switchMode('login')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => switchMode('signup')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Alert Feedback Messages */}
        {errorMsg && (
          <div 
            id="auth-error-alert"
            className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div 
            id="auth-success-alert"
            className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* ================= MODE: LOGIN / SIGN IN ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="login-email"
                className="text-xs font-semibold text-slate-300 flex items-center justify-between"
              >
                <span>Email Address</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="debater@example.com"
                  className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-xs sm:text-sm placeholder-slate-500 outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="login-password"
                  className="text-xs font-semibold text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  id="login-forgot-password-link"
                  onClick={() => switchMode('forgot-password')}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs sm:text-sm placeholder-slate-500 outline-hidden transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#1b223d] bg-[#060815] text-indigo-600 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#ec4899] hover:from-[#4338ca] hover:via-[#6d28d9] hover:to-[#db2777] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Credentials...
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Fill Pills */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Quick Demo Accounts:</span>
                <span className="text-[10px] text-indigo-400">Click to fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_ACCOUNTS.map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickDemoFill(acc)}
                    className="p-2 rounded-lg bg-[#0f142d] hover:bg-[#161d40] border border-[#222b55] text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {acc.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Logins */}
            <div className="pt-2 space-y-2">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="py-2.5 px-3 bg-[#0c1024] hover:bg-[#121838] border border-[#1b223d] rounded-xl text-xs font-medium text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-rose-400" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('GitHub')}
                  className="py-2.5 px-3 bg-[#0c1024] hover:bg-[#121838] border border-[#1b223d] rounded-xl text-xs font-medium text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            {/* Bottom Switcher */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1 underline underline-offset-2"
                >
                  Sign up now
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ================= MODE: SIGN UP / REGISTER ================= */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4 relative z-10">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label 
                htmlFor="signup-name"
                className="text-xs font-semibold text-slate-300"
              >
                Full Name / Debater Handle
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-xs sm:text-sm placeholder-slate-500 outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="signup-email"
                className="text-xs font-semibold text-slate-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.debater@university.edu"
                  className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-xs sm:text-sm placeholder-slate-500 outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="signup-password"
                className="text-xs font-semibold text-slate-300"
              >
                Create Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs sm:text-sm placeholder-slate-500 outline-hidden transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="signup-confirm-password"
                className="text-xs font-semibold text-slate-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs sm:text-sm placeholder-slate-500 outline-hidden transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Debater Experience Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Debate Experience Tier</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Novice', 'Collegiate', 'Advanced'] as const).map((tier) => (
                  <button
                    type="button"
                    key={tier}
                    onClick={() => setDebaterLevel(tier)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      debaterLevel === tier
                        ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-sm'
                        : 'border-[#1b223d] bg-[#060815] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-[#1b223d] bg-[#060815] text-indigo-600 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5 mt-0.5 shrink-0"
                />
                <span className="leading-snug text-[11px] text-slate-400">
                  I commit to fair dialectical sportsmanship and adhere to DebateAI ethics guidelines.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="signup-submit-btn"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#ec4899] hover:from-[#4338ca] hover:via-[#6d28d9] hover:to-[#db2777] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <span>Create Debater Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Bottom Switcher */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1 underline underline-offset-2"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ================= MODE: FORGOT PASSWORD ================= */}
        {mode === 'forgot-password' && (
          <div className="space-y-4 relative z-10">
            {resetStep === 1 ? (
              /* Step 1: Request Code */
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <div className="p-3 bg-[#0c1024] border border-[#1b223d] rounded-xl text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password Recovery</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Provide the email associated with your DebateAI profile. We'll send a 6-digit verification code to reset your password.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label 
                    htmlFor="forgot-email"
                    className="text-xs font-semibold text-slate-300"
                  >
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. demo@debateai.org"
                      className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-xs sm:text-sm placeholder-slate-500 outline-hidden transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="forgot-request-code-btn"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Verification Code...
                    </span>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verification Code & New Password */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-xs text-indigo-200 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verification Code Sent</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    We generated security code <strong className="text-amber-300 font-mono text-xs">{generatedCode}</strong> for demo verification.
                  </p>
                </div>

                {/* 6-digit code input */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="forgot-code"
                    className="text-xs font-semibold text-slate-300"
                  >
                    6-Digit Code
                  </label>
                  <input
                    id="forgot-code"
                    type="text"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="482910"
                    className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-center tracking-widest font-mono text-base text-white outline-hidden"
                    required
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="forgot-new-password"
                    className="text-xs font-semibold text-slate-300"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="forgot-new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs sm:text-sm outline-hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="forgot-confirm-password"
                    className="text-xs font-semibold text-slate-300"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="forgot-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#060815] border border-[#1b223d] focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs sm:text-sm outline-hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="forgot-submit-reset-btn"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating Security Password...
                    </span>
                  ) : (
                    <>
                      <span>Reset Password & Sign In</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Sign In Link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                id="forgot-back-to-login-btn"
                onClick={() => switchMode('login')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Skip / Continue as Guest Option */}
        <div className="pt-2 border-t border-slate-800/60 text-center">
          <button
            type="button"
            id="auth-continue-guest-btn"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
          >
            Skip for now &bull; Continue as Guest Debater
          </button>
        </div>

      </div>

    </div>
  );
};
