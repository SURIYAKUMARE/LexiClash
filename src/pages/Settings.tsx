import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Settings as SettingsIcon,
  Key,
  Bell,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, profile } = useAuth();

  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('user_gemini_api_key') || '');
  const [keySaved, setKeySaved] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [adaptiveNotifs, setAdaptiveNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

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
      downloadAnchor.setAttribute('download', `skillpath-export-${user?.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert(err?.message || 'Failed to export data.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-charcoal">Account & Platform Settings</h1>
        <p className="text-xs text-charcoal-muted">
          Manage your system preferences, AI provider keys, notifications, and export personal records.
        </p>
      </div>

      {/* AI Engine Configuration */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-border pb-3">
          <Key className="w-5 h-5 text-brand-600" />
          <div>
            <h3 className="text-sm font-bold text-charcoal">AI Engine & Gemini Provider Configuration</h3>
            <p className="text-xs text-charcoal-muted">
              Configure your Google Gemini API key or use our intelligent deterministic heuristic fallback engine.
            </p>
          </div>
        </div>

        {keySaved && (
          <div className="p-3 bg-status-success-bg border border-emerald-200 rounded-lg text-xs text-status-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Gemini API Key configuration updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSaveApiKey} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">
              Google Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
            <span className="text-[11px] text-charcoal-subtle block mt-1">
              If omitted, the platform uses our built-in 7-agent heuristic engine, guaranteeing 100% operational functionality without crashing.
            </span>
          </div>

          <Button type="submit" variant="primary" size="sm">
            Save Provider Preference
          </Button>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-border pb-3">
          <Bell className="w-5 h-5 text-brand-600" />
          <h3 className="text-sm font-bold text-charcoal">Notification & Adaptive Alerts</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 bg-surface-subtle rounded-xl border border-surface-border cursor-pointer">
            <div>
              <span className="font-semibold text-charcoal block">Adaptive Roadmap Alerts</span>
              <span className="text-charcoal-muted text-[11px]">Receive notifications when assessments inject remediation tasks or accelerate mastery.</span>
            </div>
            <input
              type="checkbox"
              checked={adaptiveNotifs}
              onChange={(e) => setAdaptiveNotifs(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-surface-subtle rounded-xl border border-surface-border cursor-pointer">
            <div>
              <span className="font-semibold text-charcoal block">Streak & Activity Reminders</span>
              <span className="text-charcoal-muted text-[11px]">Daily notifications to preserve your active learning streak.</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-surface-subtle rounded-xl border border-surface-border cursor-pointer">
            <div>
              <span className="font-semibold text-charcoal block">Weekly Progress Digest</span>
              <span className="text-charcoal-muted text-[11px]">Summary of skills acquired, tasks finished, and readiness delta.</span>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
          </label>
        </div>
      </Card>

      {/* Data Export & Privacy */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-border pb-3">
          <Download className="w-5 h-5 text-brand-600" />
          <div>
            <h3 className="text-sm font-bold text-charcoal">Data Portability & Export</h3>
            <p className="text-xs text-charcoal-muted">Download all your verified skills, roadmap tasks, and assessment scores in standard JSON format.</p>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Complete Learning Data (JSON)
          </Button>
        </div>
      </Card>
    </div>
  );
};
