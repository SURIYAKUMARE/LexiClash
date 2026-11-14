import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Key,
  Bell,
  Download,
  CheckCircle2,
  Moon,
  Sun,
  User,
  Check
} from 'lucide-react';

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

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'engine', label: 'AI Provider Key' },
    { key: 'export', label: 'Data Export' }
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

      {/* TAB 5: DATA EXPORT */}
      {activeTab === 'export' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Data Portability & Export
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Download your verified skill credentials, roadmap progress, and assessment telemetry.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed max-w-lg">
              You own all data generated on SkillPath. Exporting downloads an unencrypted JSON document containing your profile, verified competencies, curriculum progress, and diagnostic history.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download Learning History (.JSON)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Settings;
