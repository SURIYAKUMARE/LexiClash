import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Moon,
  Sun,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Building2
} from 'lucide-react';

type PortalMode = 'student' | 'regulatory';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithPasscode } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mode: 'student' (Image 1: Student Assessment Portal) vs 'regulatory' (Image 2: NIYAM Regulatory Portal)
  const [portalMode, setPortalMode] = useState<PortalMode>('student');

  // Form State
  const [studentId, setStudentId] = useState('demo@skillpath.app');
  const [password, setPassword] = useState('Demo@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Regulatory Mode SSO Role Selection (Image 2)
  const roles = [
    { id: 'student', label: 'Student', username: 'demo@skillpath.app', roleName: 'CS Student' },
    { id: 'officer', label: 'Officer', username: 'officer.academic', roleName: 'Academic Officer' },
    { id: 'applicant', label: 'Applicant', username: 'applicant.grad', roleName: 'Graduate Applicant' },
    { id: 'admin', label: 'Admin', username: 'admin.council', roleName: 'System Administrator' },
    { id: 'auditor', label: 'Auditor', username: 'auditor', roleName: 'Regulatory Auditor' }
  ];
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  // Captcha State (Image 2)
  const [captchaCode, setCaptchaCode] = useState('L3UY3');
  const [enteredCaptcha, setEnteredCaptcha] = useState('L3UY3');

  // 4-Digit MPIN Modal State
  const [isMpinOpen, setIsMpinOpen] = useState(false);
  const [mpin, setMpin] = useState('');

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setEnteredCaptcha(code);
  };

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

  const handleRegulatoryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCaptcha.toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Security Code (Captcha) does not match.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await login({ email: studentId, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role);
    setStudentId(role.username);
    setPassword('Demo@1234');
  };

  const handleMpinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mpin.length < 4) {
      setError('Please enter a 4-digit MPIN.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await loginWithPasscode(mpin);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid MPIN passcode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat overflow-y-auto"
      style={{
        backgroundImage: `url(${
          portalMode === 'student'
            ? '/images/campus-student-portal.png'
            : '/images/campus-regulatory-portal.png'
        })`
      }}
    >
      {/* Dark Translucent Backdrop Overlay with Vignette */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

      {/* Floating Top Portal Mode Switcher */}
      <div className="relative z-20 mb-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-1.5 py-1 rounded-full shadow-lg border border-white/50 dark:border-slate-700/60 flex items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setPortalMode('student');
            setStudentId('demo@skillpath.app');
            setPassword('Demo@1234');
          }}
          className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
            portalMode === 'student'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Student Portal
        </button>

        <button
          type="button"
          onClick={() => {
            setPortalMode('regulatory');
            setStudentId(selectedRole.username);
            setPassword('Demo@1234');
          }}
          className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
            portalMode === 'regulatory'
              ? 'bg-[#0f294a] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Regulatory Portal (SSO)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VARIANT 1: STUDENT ASSESSMENT PORTAL (Matches Image 1 Exactly)           */}
      {/* ========================================================================= */}
      {portalMode === 'student' && (
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
              to="/library"
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
      )}

      {/* ========================================================================= */}
      {/* VARIANT 2: REGULATORY PORTAL SSO (Matches Image 2 Exactly)               */}
      {/* ========================================================================= */}
      {portalMode === 'regulatory' && (
        <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/80 dark:border-slate-800 p-6 sm:p-7 text-slate-800 dark:text-slate-100 transition-all">
          {/* Top Row: Back to Home + Status + Theme Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <Link
              to="/"
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Portal Home
            </Link>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AICTE Core Online
              </span>

              <button
                type="button"
                onClick={toggleTheme}
                title="Toggle Theme"
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Emblem & Official Seal Header */}
          <div className="text-center mt-3">
            <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <Building2 className="w-6 h-6 text-amber-700" />
            </div>

            <div className="text-[10px] font-bold text-amber-800 dark:text-amber-400 mt-1.5 uppercase tracking-wide">
              अखिल भारतीय तकनीकी शिक्षा परिषद
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              NIYAM Regulatory Portal
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              AICTE Approval &amp; Compliance Management
            </p>
          </div>

          {/* Authorized Role Selection (Single Sign-On SSO Box) */}
          <div className="mt-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Authorized Role Selection
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                SINGLE SIGN-ON (SSO)
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {roles.map(r => {
                const isSelected = selectedRole.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`py-1 rounded text-[10px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#0a1e38] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                <strong>{selectedRole.roleName}</strong>{' '}
                <span className="font-mono text-[10px] text-slate-400">({selectedRole.username})</span>
              </span>
              <button
                type="button"
                onClick={handleRegulatoryLogin}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] transition-colors"
              >
                Sign In as {selectedRole.label}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-2.5 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegulatoryLogin} className="mt-3 space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                Username / Official ID
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[9px] font-mono text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 rounded">
                  PW: Demo@1234
                </span>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Captcha Security Code Box */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Security Code (Captcha)
                </label>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">
                  Auto-verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-mono font-bold tracking-widest text-blue-700 dark:text-blue-400 text-sm select-none line-through">
                    {captchaCode}
                  </span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    title="Refresh Captcha"
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                  >
                    <RotateCw className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={enteredCaptcha}
                  onChange={e => setEnteredCaptcha(e.target.value)}
                  className="px-3 py-1.5 text-xs text-center font-mono font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#0a1e38] hover:bg-[#061427] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <span>Authenticating Official Session...</span>
              ) : (
                <>
                  Sign In to Official Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Secondary 2FA MPIN Action */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => setIsMpinOpen(true)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Verify with 4-Digit MPIN (Compliance 2FA Demo)
            </button>
          </div>

          {/* Compliance Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-1">
            <div className="text-[9px] font-mono text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              256-Bit TLS &bull; 4-Digit MPIN Protected &bull; IT Act 2000 Compliant
            </div>
            <div className="text-[10px] text-slate-500">
              New institutional applicant?{' '}
              <Link to="/register" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                Register institutional account
              </Link>
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              AICTE Problem Statement 26262 &bull; APH 2025-26
            </div>
          </div>
        </div>
      )}

      {/* 4-Digit MPIN Modal Dialog */}
      {isMpinOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xs w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Enter 4-Digit MPIN
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Fast unlock your offline-encrypted session with PIN (e.g. 1234).
            </p>

            <form onSubmit={handleMpinSubmit} className="mt-4 space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={mpin}
                onChange={e => setMpin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-32 mx-auto text-center font-mono tracking-widest text-lg py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsMpinOpen(false)}
                  className="flex-1 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Verify MPIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
