import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  UserCheck,
  BrainCircuit,
  Compass,
  MapPin,
  BookOpen,
  CheckSquare,
  Bot,
  Activity,
  FolderGit2,
  BarChart3,
  Award,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', to: '/profile', icon: UserCheck },
    { name: 'Skill Analysis', to: '/skills', icon: BrainCircuit },
    { name: 'Career Explorer', to: '/careers', icon: Compass },
    { name: 'Learning Roadmap', to: '/roadmap', icon: MapPin },
    { name: 'Course Library', to: '/resources', icon: BookOpen },
    { name: 'Assessments', to: '/assessments', icon: CheckSquare },
    { name: 'AI Mentor', to: '/mentor', icon: Bot, badge: 'AI' },
    { name: 'Agent Monitor', to: '/agents', icon: Activity, badge: '7 Agents' },
    { name: 'Projects', to: '/projects', icon: FolderGit2 },
    { name: 'Progress Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'Certificates', to: '/certificates', icon: Award },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col h-full select-none">
      {/* Brand Logo & Tagline */}
      <div className="p-5 border-b border-surface-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-violetAccent-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-charcoal block leading-none">
            SkillPath <span className="text-brand-600">AI</span>
          </span>
          <span className="text-[10px] text-charcoal-subtle font-medium block mt-1 tracking-tight">
            Your Skills. Your Career.
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onItemClick}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle'
              )
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-charcoal-subtle group-hover:text-brand-600 transition-colors" />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-100 text-brand-800">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Profile Summary Card */}
      <div className="p-4 border-t border-surface-border bg-surface-subtle">
        <div className="text-[11px] text-charcoal-subtle flex items-center justify-between">
          <span>Engine: Multi-Agent</span>
          <span className="text-status-success font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" /> Live
          </span>
        </div>
      </div>
    </aside>
  );
};
