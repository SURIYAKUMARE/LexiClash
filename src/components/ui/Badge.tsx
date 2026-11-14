import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'violet' | 'success' | 'warning' | 'danger' | 'neutral';
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
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    violet: 'bg-violetAccent-50 text-violetAccent-700 border-violetAccent-200',
    success: 'bg-status-success-bg text-status-success border-emerald-200',
    warning: 'bg-status-warning-bg text-status-warning border-amber-200',
    danger: 'bg-status-danger-bg text-status-danger border-red-200',
    neutral: 'bg-surface-muted text-charcoal-muted border-surface-border',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border leading-none shrink-0',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {verified && <ShieldCheck className="w-3.5 h-3.5 text-status-success shrink-0" />}
      {children}
    </span>
  );
};
