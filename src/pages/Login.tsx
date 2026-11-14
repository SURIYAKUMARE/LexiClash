import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Form State
  const [studentId, setStudentId] = useState('demo@skillpath.app');
  const [password, setPassword] = useState('Demo@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email: studentId, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check your Student ID and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat overflow-y-auto"
      style={{
        backgroundImage: `url('/images/campus-student-portal.png')`
      }}
    >
      {/* Dark Translucent Backdrop Overlay with Vignette */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

      {/* Top Floating Controls (Theme Toggle) */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-md transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* STUDENT ASSESSMENT PORTAL CARD */}
      <div className="relative z-10 w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/80 dark:border-slate-800 p-7 sm:p-8 text-slate-800 dark:text-slate-100 transition-all">
        {/* Card Top Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 font-bold uppercase">
              ACADEMIC PORTAL &bull; 2026
            </span>
          </div>

          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Library Hub
          </Link>
        </div>

        {/* Center Logo Icon */}
        <div className="text-center mt-3">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center mx-auto shadow-md">
            <img
              src="/images/lexiclash-logo.jpg"
              alt="LexiClash Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Pill Badge */}
          <div className="mt-3">
            <span className="text-[10px] font-mono tracking-wider font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 px-3 py-0.5 rounded-full inline-block">
              AICTE &amp; GATE MODEL SYLLABUS
            </span>
          </div>

          {/* Portal Title & Subtitle */}
          <h1
            className="font-serif italic font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight mt-2.5"
            style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', serif" }}
          >
            Student Assessment Portal
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed mt-1 max-w-[310px] mx-auto">
            Verify your student identity to take proctored course assessments or record semester scores.
          </p>
        </div>

        {/* Quick Demo Pre-seed Hint */}
        <div className="mt-4 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 truncate">
            Demo: <strong className="text-blue-600 dark:text-blue-400 font-mono">demo@skillpath.app</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setStudentId('demo@skillpath.app');
              setPassword('Demo@1234');
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[10px] shrink-0"
          >
            Auto-Fill
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleStudentLogin} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student ID / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="Enter Student ID / Username"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Verification Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              <>
                Verify Student Access
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Authorized Footer Notice */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Authorized Proctored Academic Session</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            New learner?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Create new profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
