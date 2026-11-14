import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Key,
  Bell,
  Download,
  Upload,
  CheckCircle2,
  Moon,
  Sun,
  User,
  Check,
  RefreshCw,
  Database,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { OfflineSyncManager, SyncStatus, ConflictStrategy } from '../offlineSync/syncManager';

export const Settings: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'engine' | 'export'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [hoursPerWeek, setHoursPerWeek] = useState(profile?.hoursPerWeek || 10);
  const [profileSaved, setProfileSaved] = useState(false);

  // Engine Key State
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('user_gemini_api_key') || '');
  const [keySaved, setKeySaved] = useState(false);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [adaptiveNotifs, setAdaptiveNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Offline Sync & Portability State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null,
    conflictStrategy: 'client-wins'
  });
  const [importStatusMessage, setImportStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isExportingFull, setIsExportingFull] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    OfflineSyncManager.init();
    const unsubscribe = OfflineSyncManager.subscribe(setSyncStatus);
    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        college,
        hoursPerWeek: Number(hoursPerWeek)
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update profile.');
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (geminiKey.trim()) {
      localStorage.setItem('user_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 3000);
  };

  const handleExportData = async () => {
    try {
      const [profileData, skillsData, roadmapData] = await Promise.all([
        api.getProfile(),
        api.getSkills(),
        api.getRoadmap()
      ]);

      const fullExport = {
        exportedAt: new Date().toISOString(),
        user: { name: user?.name, email: user?.email },
        profile: profileData.profile,
        skills: skillsData.skills,
        roadmap: roadmapData.roadmap
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullExport, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `skillpath-export-${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'data'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert(err?.message || 'Failed to export data.');
    }
  };

  const handleExportFullBackup = async () => {
    try {
      setIsExportingFull(true);
      const json = await OfflineSyncManager.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillpath-database-v3-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExportingFull(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await OfflineSyncManager.importBackup(text);
      setImportStatusMessage({ text: res.message, isError: !res.success });
      if (res.success) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err: any) {
      setImportStatusMessage({ text: `Failed to parse backup: ${err.message}`, isError: true });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncingNow(true);
    await OfflineSyncManager.processSyncQueue();
    setIsSyncingNow(false);
  };

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'engine', label: 'AI Provider Key' },
    { key: 'export', label: 'Data & Offline Sync' }
  ] as const;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
          Manage your account preferences, theme appearance, notifications, and AI provider key.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-surface-border dark:border-surface-dark-border pb-2 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-slate-200 hover:bg-surface-subtle dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Account Profile
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Basic identification details and weekly study commitment.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3 bg-status-success-bg dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-status-success flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Profile information updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                disabled
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-slate-50 dark:bg-slate-800/50 text-charcoal-muted dark:text-slate-400 cursor-not-allowed"
              />
              <span className="text-[11px] text-charcoal-subtle dark:text-slate-500 mt-1 block">
                Email: {user?.email}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={e => setCollege(e.target.value)}
                placeholder="e.g. Stanford University, MIT, IIT Bombay"
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                Target Study Hours Per Week
              </label>
              <input
                type="number"
                min="2"
                max="60"
                value={hoursPerWeek}
                onChange={e => setHoursPerWeek(Number(e.target.value))}
                className="w-32 px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600"
              />
              <span className="text-[11px] text-charcoal-subtle dark:text-slate-500 mt-1 block">
                Roadmap milestones adapt their pace to your weekly commitment.
              </span>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: APPEARANCE */}
      {activeTab === 'appearance' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Appearance & Theme
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Select your interface color theme preference.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => { if (theme !== 'light') toggleTheme(); }}
              className={`p-4 rounded-lg border text-left transition-all ${
                theme === 'light'
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Sun className="w-4 h-4 text-brand-600" />
                {theme === 'light' && <Check className="w-3.5 h-3.5 text-brand-600" />}
              </div>
              <span className="text-xs font-bold text-charcoal dark:text-slate-100 block">
                Light Mode
              </span>
              <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                High contrast crisp white surfaces and soft gray backgrounds.
              </span>
            </button>

            <button
              type="button"
              onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              className={`p-4 rounded-lg border text-left transition-all ${
                theme === 'dark'
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Moon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                {theme === 'dark' && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
              </div>
              <span className="text-xs font-bold text-charcoal dark:text-slate-100 block">
                Dark Mode
              </span>
              <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                Deep obsidian canvas with subtle borders for low-light study sessions.
              </span>
            </button>
          </div>
        </Card>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Notification Preferences
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Choose which learning events and reminders you wish to receive.
            </p>
          </div>

          <div className="space-y-3 max-w-xl">
            <label className="flex items-center justify-between p-3 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-charcoal dark:text-slate-100 block">
                  Adaptive Roadmap Alerts
                </span>
                <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                  Notify when assessment results recalibrate your curriculum.
                </span>
              </div>
              <input
                type="checkbox"
                checked={adaptiveNotifs}
                onChange={e => setAdaptiveNotifs(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-charcoal dark:text-slate-100 block">
                  Daily Streak Reminder
                </span>
                <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                  Daily prompt to keep your active study streak alive.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-charcoal dark:text-slate-100 block">
                  Weekly Progress Digest
                </span>
                <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                  Summary email of tasks finished and readiness score growth.
                </span>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={e => setWeeklyDigest(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-0"
              />
            </label>
          </div>
        </Card>
      )}

      {/* TAB 4: AI PROVIDER KEY */}
      {activeTab === 'engine' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              AI Engine & Provider Key
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Optional Google Gemini API key configuration with deterministic fallback guarantee.
            </p>
          </div>

          {keySaved && (
            <div className="p-3 bg-status-success-bg dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-status-success flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Provider configuration updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveApiKey} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                Google Gemini API Key (Optional)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 font-mono focus:outline-none focus:border-brand-600"
              />
              <span className="text-[11px] text-charcoal-subtle dark:text-slate-500 mt-1.5 block leading-relaxed">
                If omitted, SkillPath uses our built-in 7-agent deterministic heuristic engine, guaranteeing 100% operational functionality without crashing or exposing API keys.
              </span>
            </div>

            <Button type="submit" variant="primary" size="sm">
              Save Provider Preference
            </Button>
          </form>
        </Card>
      )}

      {/* TAB 5: DATA PORTABILITY & OFFLINE SYNC */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {importStatusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-fade-in ${
                importStatusMessage.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importStatusMessage.text}</span>
            </div>
          )}

          {/* Offline Sync State Card */}
          <Card className="space-y-4">
            <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-charcoal dark:text-slate-100 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-brand-600" />
                  Offline Sync Status & Outbox
                </h2>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                  Local-first Dexie IndexedDB persistence with background outbox synchronization.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    syncStatus.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="font-mono text-xs font-semibold text-charcoal dark:text-slate-200">
                  {syncStatus.isOnline ? 'Network Online' : 'Network Offline (IndexedDB Active)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-surface-subtle dark:bg-surface-dark-card rounded-lg border border-surface-border dark:border-surface-dark-border">
                <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
                  Pending Sync Mutations
                </span>
                <span className="text-xl font-bold font-mono text-charcoal dark:text-slate-100 mt-0.5 block">
                  {syncStatus.pendingCount} records
                </span>
              </div>

              <div className="p-3 bg-surface-subtle dark:bg-surface-dark-card rounded-lg border border-surface-border dark:border-surface-dark-border">
                <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
                  Last Synchronization
                </span>
                <span className="text-sm font-mono font-medium text-charcoal dark:text-slate-100 mt-1 block">
                  {syncStatus.lastSyncedAt || 'Not yet synced'}
                </span>
              </div>

              <div className="p-3 bg-surface-subtle dark:bg-surface-dark-card rounded-lg border border-surface-border dark:border-surface-dark-border">
                <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
                  Active Conflict Rule
                </span>
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 mt-1 block uppercase">
                  {syncStatus.conflictStrategy}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 items-center">
              <Button
                variant="primary"
                size="sm"
                onClick={handleTriggerSync}
                disabled={isSyncingNow || syncStatus.pendingCount === 0}
                className="text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow ? 'animate-spin' : ''}`} />
                {isSyncingNow ? 'Processing Sync...' : `Process Outbox Queue (${syncStatus.pendingCount})`}
              </Button>
            </div>
          </Card>

          {/* Conflict Resolution Strategy */}
          <Card className="space-y-4">
            <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
              <h2 className="text-sm font-bold text-charcoal dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Conflict Resolution Strategy
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Determine reconciliation precedence when mutations occur offline on multiple clients.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => OfflineSyncManager.setConflictStrategy('client-wins')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  syncStatus.conflictStrategy === 'client-wins'
                    ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/30'
                    : 'border-surface-border dark:border-surface-dark-border hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-charcoal dark:text-slate-100">
                    Client-Wins (Local First)
                  </span>
                  {syncStatus.conflictStrategy === 'client-wins' && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  )}
                </div>
                <p className="text-[11px] text-charcoal-muted dark:text-slate-400 leading-relaxed">
                  IndexedDB client records remain authoritative during merge. Recommended for private study environments.
                </p>
              </button>

              <button
                type="button"
                onClick={() => OfflineSyncManager.setConflictStrategy('last-write-wins')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  syncStatus.conflictStrategy === 'last-write-wins'
                    ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/30'
                    : 'border-surface-border dark:border-surface-dark-border hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-charcoal dark:text-slate-100">
                    Last-Write-Wins (Timestamp)
                  </span>
                  {syncStatus.conflictStrategy === 'last-write-wins' && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  )}
                </div>
                <p className="text-[11px] text-charcoal-muted dark:text-slate-400 leading-relaxed">
                  Evaluates ISO-8601 mutation timestamps and preserves whichever record has the latest timestamp.
                </p>
              </button>
            </div>
          </Card>

          {/* Database Backup & Restore */}
          <Card className="space-y-4">
            <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
              <h2 className="text-sm font-bold text-charcoal dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-600" />
                IndexedDB Snapshot Backup & Restore
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Export an all-table schema snapshot or restore from an existing JSON state file.
              </p>
            </div>

            <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed max-w-xl">
              You own all data stored inside your browser. Exporting produces an unencrypted snapshot containing verified competencies, coding challenges, capstone submissions, mock interview scorecards, and learning roadmap modules.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportFullBackup}
                disabled={isExportingFull}
                className="text-xs gap-1.5"
              >
                <Download className="w-4 h-4" />
                {isExportingFull ? 'Generating Snapshot...' : 'Export Full Database Backup (.JSON)'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="text-xs gap-1.5"
              >
                <Download className="w-4 h-4" />
                Export Profile & Progress (.JSON)
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Restore Snapshot from File
              </Button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-900 dark:text-amber-300">
              <strong>Notice:</strong> Restoring a backup merges database records into your current IndexedDB instance using non-destructive bulk upsertion.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Settings;
