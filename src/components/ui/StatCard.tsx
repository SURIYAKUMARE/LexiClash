import React from 'react';
import { Card } from './Card';
import { clsx } from 'clsx';

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'brand' | 'success' | 'warning' | 'info';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  className,
}) => {
  return (
    <Card className={clsx('relative p-4 dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-charcoal dark:text-white">{value}</span>
            {subValue && <span className="text-xs text-charcoal-muted dark:text-slate-400">{subValue}</span>}
          </div>
        </div>
        {icon && (
          <div className="w-8 h-8 rounded border border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-surface-dark-muted flex items-center justify-center text-brand-600 dark:text-brand-300 shrink-0">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2.5 flex items-center text-xs">
          <span className={clsx('font-medium mr-1', trend.isPositive ? 'text-status-success' : 'text-charcoal-subtle dark:text-slate-400')}>
            {trend.value}
          </span>
          <span className="text-charcoal-subtle dark:text-slate-400 text-[11px]">vs last week</span>
        </div>
      )}
    </Card>
  );
};
