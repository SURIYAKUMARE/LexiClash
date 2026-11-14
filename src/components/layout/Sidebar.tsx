import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { LexiClashLogo } from '../common/LexiClashLogo';
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
  User,
  Globe2,
  Server,
  Activity,
  Flame,
  Terminal,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const coreNav = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Learning Universe', to: '/universe', icon: Globe2 },
    { name: 'Placement Diagnostic', to: '/placement', icon: Compass },
    { name: 'Profile & Vault', to: '/profile', icon: User },
    { name: 'Gap Diagnostics', to: '/diagnostics', icon: BrainCircuit },
    { name: 'Career Match', to: '/careers', icon: Compass },
    { name: 'Learning Roadmap', to: '/roadmap', icon: MapPin },
  ];

  const simulationNav = [
    { name: 'Cloud Console', to: '/cloud-console', icon: Server },
    { name: 'Architecture Visualizer', to: '/architecture', icon: Layers },
    { name: 'Incident War Room', to: '/war-room', icon: Flame },
    { name: 'CLI Terminal', to: '/terminal', icon: Terminal },
    { name: 'Security Inspector', to: '/security-inspector', icon: ShieldAlert },
  ];

  const intelligenceNav = [
    { name: 'Assessments', to: '/assessments', icon: CheckSquare },
    { name: 'Verified Portfolio', to: '/portfolio', icon: Award },
    { name: 'AI Mentor', to: '/mentor', icon: MessageSquareCode },
    { name: 'Agent Activity', to: '/agents', icon: Activity },
    { name: 'Project Studio', to: '/projects', icon: FolderGit2 },
    { name: 'Resource Library', to: '/resources', icon: BookOpen },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const renderNavSection = (title: string, items: typeof coreNav) => (
    <div className="space-y-0.5 pt-2 first:pt-0">
      <div className="px-3 py-1 text-[10px] font-mono font-semibold text-charcoal-subtle dark:text-slate-500 uppercase tracking-wider">
        {title}
      </div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onItemClick}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
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
  );

  return (
    <aside className="w-60 bg-surface dark:bg-surface-dark border-r border-surface-border dark:border-surface-dark-border flex flex-col h-full select-none transition-colors">
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-surface-border dark:border-surface-dark-border flex items-center gap-2">
        <LexiClashLogo size="sm" showText={true} />
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 divide-y divide-surface-border/40 dark:divide-slate-800">
        {renderNavSection('Core Journey', coreNav)}
        {renderNavSection('Cloud & SRE Simulations', simulationNav)}
        {renderNavSection('Proof & Intelligence', intelligenceNav)}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-surface-dark-subtle text-[11px] text-charcoal-subtle dark:text-slate-400 flex items-center justify-between">
        <span>Target: Full Stack & Cloud</span>
        <span className="text-brand-600 dark:text-brand-400 font-medium">Active</span>
      </div>
    </aside>
  );
};
