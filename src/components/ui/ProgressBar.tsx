import React from 'react';
import { clsx } from 'clsx';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'brand' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'brand',
  size = 'md',
  showLabel = false,
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const colorClasses = {
    brand: 'bg-brand-600',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('w-full bg-surface-muted dark:bg-surface-dark-muted rounded overflow-hidden', sizeClasses[size])}>
        <div
          className={clsx('h-full transition-all duration-300 rounded', colorClasses[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-[11px] text-charcoal-muted dark:text-slate-400 mt-1">
          <span>Progress</span>
          <span className="font-semibold text-charcoal dark:text-slate-200">{clamped}%</span>
        </div>
      )}
    </div>
  );
};
