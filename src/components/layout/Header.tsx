import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import {
  Menu,
  Bell,
  Flame,
  CheckCircle,
  ExternalLink,
  LogOut,
  User,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const completion = profile?.profileCompletionPercentage || 40;

  return (
    <header className="h-16 bg-surface border-b border-surface-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-charcoal">
            Welcome back, <span className="text-brand-600">{user?.name || 'Learner'}</span>
          </h2>
          <p className="text-xs text-charcoal-subtle">
            Targeting: <span className="font-medium text-charcoal">{profile?.targetCareerRoleId ? profile.targetCareerRoleId.replace('role-', '').toUpperCase() : 'Full Stack'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span>{profile?.streakDays || 1} Day Streak</span>
        </div>

        {/* Profile Completion Bar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-subtle border border-surface-border rounded-full text-xs">
          <span className="text-charcoal-subtle">Profile:</span>
          <div className="w-16 h-2 bg-surface-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${completion}%` }} />
          </div>
          <span className="font-semibold text-charcoal">{completion}%</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="p-2 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-status-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-surface-border rounded-xl shadow-float overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between bg-surface-subtle">
                <span className="text-xs font-semibold text-charcoal">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-charcoal-subtle">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 hover:bg-surface-subtle transition-colors cursor-pointer text-left ${
                        !notif.read ? 'bg-brand-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-charcoal">{notif.title}</span>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-brand-600 mt-1 shrink-0" />}
                      </div>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-charcoal-subtle block mt-1.5">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-subtle transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-surface-border"
            />
            <ChevronDown className="w-4 h-4 text-charcoal-subtle hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-surface border border-surface-border rounded-xl shadow-float overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 py-1">
              <div className="px-4 py-2.5 border-b border-surface-border">
                <p className="text-xs font-semibold text-charcoal truncate">{user?.name}</p>
                <p className="text-[11px] text-charcoal-subtle truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle"
              >
                <User className="w-4 h-4 text-charcoal-subtle" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle"
              >
                <Settings className="w-4 h-4 text-charcoal-subtle" />
                <span>Settings</span>
              </Link>

              <div className="border-t border-surface-border my-1" />

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-status-danger hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-status-danger" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
