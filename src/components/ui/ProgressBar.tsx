import React from 'react';
import { clsx } from 'clsx';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'brand' | 'violet' | 'success' | 'warning' | 'danger';
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
    violet: 'bg-violetAccent-600',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('w-full bg-surface-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={clsx('h-full transition-all duration-500 rounded-full', colorClasses[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-charcoal-muted mt-1.5">
          <span>Progress</span>
          <span className="font-semibold text-charcoal">{clamped}%</span>
        </div>
      )}
    </div>
  );
};
