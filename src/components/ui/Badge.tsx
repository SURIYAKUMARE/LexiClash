import React from 'react';
import { clsx } from 'clsx';
import { ShieldCheck } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  verified?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  verified = false,
  className,
  ...props
}) => {
  const variantClasses = {
    brand: 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800',
    success: 'bg-status-success-bg dark:bg-emerald-950/60 text-status-success dark:text-emerald-400 border-status-success-border dark:border-emerald-900',
    warning: 'bg-status-warning-bg dark:bg-amber-950/60 text-status-warning dark:text-amber-400 border-status-warning-border dark:border-amber-900',
    danger: 'bg-status-danger-bg dark:bg-red-950/60 text-status-danger dark:text-red-400 border-status-danger-border dark:border-red-900',
    neutral: 'bg-surface-muted dark:bg-surface-dark-muted text-charcoal-muted dark:text-slate-300 border-surface-border dark:border-surface-dark-border',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded border leading-tight shrink-0',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {verified && <ShieldCheck className="w-3.5 h-3.5 text-status-success dark:text-emerald-400 shrink-0" />}
      {children}
    </span>
  );
};
