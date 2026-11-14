import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  MapPin,
  BookOpen,
  CheckSquare,
  BarChart3,
  MessageSquareCode,
  Layers,
  FolderGit2,
  Award,
  Settings,
  User
} from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile & Vault', to: '/profile', icon: User },
    { name: 'Gap Diagnostics', to: '/diagnostics', icon: BrainCircuit },
    { name: 'Career Match', to: '/careers', icon: Compass },
    { name: 'Learning Roadmap', to: '/roadmap', icon: MapPin },
    { name: 'Resource Library', to: '/resources', icon: BookOpen },
    { name: 'Assessments', to: '/assessments', icon: CheckSquare },
    { name: 'Progress', to: '/analytics', icon: BarChart3 },
    { name: 'AI Mentor', to: '/mentor', icon: MessageSquareCode },
    { name: 'Agent Activity', to: '/agents', icon: Layers },
    { name: 'Project Studio', to: '/projects', icon: FolderGit2 },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-surface dark:bg-surface-dark border-r border-surface-border dark:border-surface-dark-border flex flex-col h-full select-none transition-colors">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-surface-border dark:border-surface-dark-border flex items-center gap-2.5">
        <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
          SP
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-charcoal dark:text-white block leading-none">
            SkillPath
          </span>
          <span className="text-[10px] text-charcoal-subtle dark:text-slate-400 block mt-0.5">
            Engineering Skills
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onItemClick}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-surface-muted dark:hover:bg-surface-dark-muted'
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0 text-charcoal-subtle dark:text-slate-400" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-surface-dark-subtle text-[11px] text-charcoal-subtle dark:text-slate-400 flex items-center justify-between">
        <span>Target: Full Stack</span>
        <span className="text-brand-600 dark:text-brand-400 font-medium">Active</span>
      </div>
    </aside>
  );
};
