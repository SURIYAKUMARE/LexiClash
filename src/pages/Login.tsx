import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Mail, Lock, AlertCircle, ArrowRight, Check } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@skillpath.ai');
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark-subtle flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* 1440px desktop container with split layout */}
      <div className="w-full max-w-5xl bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg shadow-subtle grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left: Simple Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                SP
              </div>
              <span className="font-bold text-base tracking-tight text-charcoal dark:text-white">
                SkillPath
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-charcoal dark:text-white">
              Sign in to your account
            </h1>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1">
              Enter your credentials to access your learning roadmap.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-status-danger-bg dark:bg-red-950/40 border border-status-danger-border dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-status-danger dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-subtle dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-subtle dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-surface-border dark:border-surface-dark-border">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="w-full py-2 px-3 text-xs font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-lg border border-brand-200 dark:border-brand-800 transition-colors text-center"
              >
                Autofill Demo Account (demo@skillpath.ai)
              </button>
            </div>
          </div>

          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-6 text-center sm:text-left">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Create account
            </Link>
          </p>
        </div>

        {/* Right: Plain Product Summary */}
        <div className="bg-surface-subtle dark:bg-surface-dark-subtle border-t md:border-t-0 md:border-l border-surface-border dark:border-surface-dark-border p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400 block mb-2">
              Career Skills Platform
            </span>
            <h2 className="text-lg font-bold text-charcoal dark:text-white leading-snug">
              Structured skill verification and role-aligned roadmaps.
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-2 leading-relaxed">
              SkillPath helps engineering teams and developers baseline competencies, close skill gaps, and track progress against market benchmarks.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark flex items-center justify-center shrink-0 mt-0.5 text-brand-600 dark:text-brand-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-charcoal dark:text-slate-200">
                    Realistic role benchmark matching
                  </h3>
                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-0.5">
                    Compare verified competencies against target benchmarks across Full Stack, AI/ML, DevOps, and Data roles.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark flex items-center justify-center shrink-0 mt-0.5 text-brand-600 dark:text-brand-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-charcoal dark:text-slate-200">
                    Phased weekly learning roadmaps
                  </h3>
                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-0.5">
                    Milestone-driven tasks with estimated hours, verified official resources, and criteria.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark flex items-center justify-center shrink-0 mt-0.5 text-brand-600 dark:text-brand-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-charcoal dark:text-slate-200">
                    Standardized topic assessments
                  </h3>
                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-0.5">
                    Multiple-choice and code diagnostics that identify error patterns and update verified badges.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-surface-border dark:border-surface-dark-border text-[11px] text-charcoal-subtle dark:text-slate-500">
            Enterprise dashboard design • 1px border grid system • Inter typography
          </div>
        </div>
      </div>
    </div>
  );
};
