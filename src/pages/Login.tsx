import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  Mail,
  Lock,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Compass,
  Layers,
  Cpu
} from 'lucide-react';
import { DEMO_PERSONAS } from '../db/seedData';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithPasscode, switchPersona } = useAuth();

  const [authMode, setAuthMode] = useState<'persona' | 'email' | 'passcode'>('persona');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter your local vault passcode.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await loginWithPasscode(passcode);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid passcode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScenario = async (personaId: string) => {
    setIsLoading(true);
    try {
      await switchPersona(personaId);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Failed to load scenario.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark-subtle flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* 1440px desktop container with split layout */}
      <div className="w-full max-w-5xl bg-white dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg shadow-card grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Pane (7 cols): Editorial Value Proposition + Live Interactive Skill-Gap Preview */}
        <div className="lg:col-span-7 bg-[#FAF9F6] dark:bg-slate-900/60 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-surface-border dark:border-surface-dark-border flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-stitch-blue text-white flex items-center justify-center font-bold text-xs font-mono">
                SP
              </div>
              <span className="font-bold text-base tracking-tight text-charcoal dark:text-slate-100 font-sans">
                SkillPath AI
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900 ml-1">
                Offline-First PWA
              </span>
            </div>

            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400 block mb-1">
                Google Stitch & Material 3 Editorial Standard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal dark:text-slate-100 leading-tight">
                Your Skills. Your Career. Your Personalized Journey.
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-2 leading-relaxed">
                A 100% offline-first engineering career accelerator. Evaluates competency fingerprints, identifies critical runtime blind spots, and continuously recalibrates your roadmaps.
              </p>
            </div>

            {/* Live Interactive Skill-Gap Preview Card */}
            <div className="p-4 bg-white dark:bg-surface-dark rounded-lg border border-surface-border dark:border-surface-dark-border shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
                <span className="text-xs font-bold text-charcoal dark:text-slate-200">
                  Live Methodology Preview: Target Role Gap
                </span>
                <span className="text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400">
                  Role: Full Stack
                </span>
              </div>

              {/* Skill Gap Bars Preview */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-medium mb-1">
                    <span className="text-charcoal dark:text-slate-300">Python & SQL Data Modeling</span>
                    <span className="text-status-success font-semibold">Mastered (L3/3)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-status-success w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium mb-1">
                    <span className="text-charcoal dark:text-slate-300">JavaScript & Browser Invariants</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">Gap: Needs +1 Lvl</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[60%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium mb-1">
                    <span className="text-charcoal dark:text-slate-300">Node.js Runtime & Streams</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">Critical Missing (0/4)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[15%]" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-charcoal-subtle dark:text-slate-400 border-t border-surface-border dark:border-surface-dark-border">
                <span>Calculated Baseline Readiness: <strong className="text-charcoal dark:text-slate-200 font-mono">38%</strong></span>
                <span className="text-stitch-blue dark:text-blue-400 font-medium">4 Agents Ready</span>
              </div>
            </div>

            {/* Platform Methodology Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded bg-white dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border space-y-1">
                <span className="font-bold text-charcoal dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                  100% Offline
                </span>
                <p className="text-[11px] text-charcoal-muted dark:text-slate-400 leading-snug">
                  IndexedDB Dexie store functions with zero network.
                </p>
              </div>

              <div className="p-2.5 rounded bg-white dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border space-y-1">
                <span className="font-bold text-charcoal dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-brand-600" />
                  4-Agent Engine
                </span>
                <p className="text-[11px] text-charcoal-muted dark:text-slate-400 leading-snug">
                  Profiler, Architect, Curriculum & Mentor agents.
                </p>
              </div>

              <div className="p-2.5 rounded bg-white dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border space-y-1">
                <span className="font-bold text-charcoal dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-stitch-blue" />
                  Dynamic Re-route
                </span>
                <p className="text-[11px] text-charcoal-muted dark:text-slate-400 leading-snug">
                  Injects remedial micro-modules on quiz scores &lt; 70%.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-charcoal-subtle dark:text-slate-500 font-mono pt-4 border-t border-surface-border dark:border-surface-dark-border">
            PromptWars X RTC • Material 3 Tactical Typography
          </div>
        </div>

        {/* Right Pane (5 cols): Authentication & Demo Switcher */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
              <h2 className="text-lg font-bold text-charcoal dark:text-slate-100">
                Access Platform Gateway
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Choose a pre-configured scenario or enter local credentials.
              </p>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-status-error flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Auth Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 my-4 p-1 bg-surface-subtle dark:bg-slate-800 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs">
              <button
                type="button"
                onClick={() => setAuthMode('persona')}
                className={`py-1.5 rounded text-[11px] font-semibold transition-all ${
                  authMode === 'persona'
                    ? 'bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
                }`}
              >
                Demo Scenarios
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('passcode')}
                className={`py-1.5 rounded text-[11px] font-semibold transition-all ${
                  authMode === 'passcode'
                    ? 'bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
                }`}
              >
                Local Vault
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('email')}
                className={`py-1.5 rounded text-[11px] font-semibold transition-all ${
                  authMode === 'email'
                    ? 'bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
                }`}
              >
                Email Login
              </button>
            </div>

            {/* TAB 1: ONE-CLICK DEMO PERSONAS */}
            {authMode === 'persona' && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400 block">
                  Select Evaluation Persona:
                </span>
                {DEMO_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectScenario(p.id)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-lg border border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-800/40 hover:border-brand-500 hover:bg-brand-50/20 dark:hover:bg-brand-950/20 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {p.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-charcoal-subtle group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-1 line-clamp-1 leading-normal">
                      {p.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* TAB 2: OFFLINE LOCAL VAULT PASSCODE */}
            {authMode === 'passcode' && (
              <form onSubmit={handlePasscodeLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                    Enter Local Vault Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-charcoal-subtle dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={passcode}
                      onChange={e => setPasscode(e.target.value)}
                      placeholder="e.g. 1234 or your vault PIN"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-charcoal-subtle dark:text-slate-500 mt-1 block">
                    Unlocks your encrypted client-side IndexedDB session immediately without internet access.
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-xs"
                  isLoading={isLoading}
                >
                  Unlock Local Vault
                </Button>
              </form>
            )}

            {/* TAB 3: EMAIL / PASSWORD */}
            {authMode === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-charcoal-subtle dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-subtle dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-xs mt-1"
                  isLoading={isLoading}
                >
                  Sign In
                </Button>
              </form>
            )}
          </div>

          <div className="pt-4 border-t border-surface-border dark:border-surface-dark-border text-center text-xs text-charcoal-muted dark:text-slate-400">
            Need a fresh custom profile?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Create New Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
