import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { OfflineSyncManager, SyncStatus } from '../../offlineSync/syncManager';
import { LexiClashLogo } from '../common/LexiClashLogo';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [learningMode, setLearningMode] = useState<'student' | 'professional'>('student');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null,
    conflictStrategy: 'client-wins'
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    OfflineSyncManager.init();
    const unsub = OfflineSyncManager.subscribe((status) => {
      setSyncStatus(status);
    });
    return unsub;
  }, []);

  useEffect(() => {
    api.getLearningPreference().then(pref => {
      if (pref) setLearningMode(pref.mode);
    });
  }, []);

  const handleToggleMode = async (mode: 'student' | 'professional') => {
    setLearningMode(mode);
    await api.updateLearningPreference({ mode });
    if (mode === 'professional') {
      window.location.href = 'https://rebon123.vercel.app/';
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await api.getNotifications();
        setNotifications(data.notifications);
      } catch (err) {
        // quiet error
      }
    };
    fetchNotifications();

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, read: true } : n)));
      } catch (err) {
        console.error(err);
      }
    }
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <header className="h-14 bg-surface dark:bg-surface-dark border-b border-surface-border dark:border-surface-dark-border px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal dark:hover:text-white hover:bg-surface-subtle dark:hover:bg-surface-dark-muted"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <LexiClashLogo size="xs" showText={true} />
          <span className="text-charcoal-subtle dark:text-slate-400">/</span>
          <span className="text-charcoal-muted dark:text-slate-300 hidden sm:inline">
            {profile?.targetCareerRoleId ? profile.targetCareerRoleId.replace('role-', '').replace('-', ' ').toUpperCase() : 'Full Stack Developer'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dual-Mode Learning Toggle (Student Mode vs Professional Mode) */}
        <div className="flex items-center bg-surface-subtle dark:bg-slate-800 p-0.5 rounded-lg border border-surface-border dark:border-surface-dark-border text-[10px] sm:text-[11px] font-mono">
          <button
            onClick={() => handleToggleMode('student')}
            className={`px-2 sm:px-2.5 py-1 rounded transition-colors ${
              learningMode === 'student'
                ? 'bg-white dark:bg-slate-900 font-bold text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
            }`}
            title="Student Mode: Concept whiteboards, guided diagrams & tutorials"
          >
            Student Mode
          </button>
          <button
            onClick={() => handleToggleMode('professional')}
            className={`px-2 sm:px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              learningMode === 'professional'
                ? 'bg-white dark:bg-slate-900 font-bold text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
            }`}
            title="Professional Mode: Launch Rebon Professional Cloud Platform (https://rebon123.vercel.app/)"
          >
            <span>Professional Mode</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70" />
          </button>
        </div>

        {/* Smart Offline Synchronization Status Badge & Action */}
        <div
          onClick={() => syncStatus.isOnline && OfflineSyncManager.processSyncQueue()}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer select-none transition-all ${
            syncStatus.isSyncing
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : syncStatus.isOnline
              ? syncStatus.pendingCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title={
            syncStatus.isSyncing
              ? 'Synchronizing local Dexie outbox with cloud registry...'
              : syncStatus.isOnline
              ? syncStatus.pendingCount > 0
                ? `${syncStatus.pendingCount} offline changes pending. Click to Sync Now.`
                : 'All changes synced. IndexedDB active.'
              : 'Offline Mode: Zero network required. All changes safely persisted in IndexedDB.'
          }
        >
          {syncStatus.isSyncing ? (
            <div className="w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                syncStatus.isOnline
                  ? syncStatus.pendingCount > 0
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500'
                  : 'bg-slate-400'
              }`}
            />
          )}
          <span>
            {syncStatus.isSyncing
              ? 'Syncing...'
              : syncStatus.isOnline
              ? syncStatus.pendingCount > 0
                ? `Sync (${syncStatus.pendingCount})`
                : 'Synced'
              : 'Offline (IndexedDB)'}
          </span>
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-surface-subtle dark:hover:bg-surface-dark-muted transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="p-1.5 rounded-lg border border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-surface-subtle dark:hover:bg-surface-dark-muted relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg shadow-float overflow-hidden z-50 py-1">
              <div className="px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border flex items-center justify-between bg-surface-subtle dark:bg-surface-dark-subtle">
                <span className="text-xs font-semibold text-charcoal dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-border dark:divide-surface-dark-border">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-charcoal-subtle dark:text-slate-400">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 hover:bg-surface-subtle dark:hover:bg-surface-dark-muted transition-colors cursor-pointer text-left ${
                        !notif.read ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-charcoal dark:text-slate-200">{notif.title}</span>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1 shrink-0" />}
                      </div>
                      <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-charcoal-subtle dark:text-slate-500 block mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-subtle dark:hover:bg-surface-dark-muted transition-colors border border-transparent hover:border-surface-border dark:hover:border-surface-dark-border"
          >
            <div className="w-7 h-7 rounded bg-brand-600 text-white font-semibold text-xs flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium text-charcoal dark:text-slate-200 hidden md:block">
              {user?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-subtle dark:text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg shadow-float overflow-hidden z-50 py-1">
              <div className="px-3.5 py-2 border-b border-surface-border dark:border-surface-dark-border">
                <p className="text-xs font-semibold text-charcoal dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-charcoal-subtle dark:text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-surface-subtle dark:hover:bg-surface-dark-muted"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-surface-subtle dark:hover:bg-surface-dark-muted"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Link>

              <div className="border-t border-surface-border dark:border-surface-dark-border my-1" />

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-status-danger hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-status-danger" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
