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
  accentColor?: 'brand' | 'violet' | 'success' | 'warning' | 'info';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  accentColor = 'brand',
  className,
}) => {
  const iconBgClasses = {
    brand: 'bg-brand-50 text-brand-600',
    violet: 'bg-violetAccent-50 text-violetAccent-600',
    success: 'bg-status-success-bg text-status-success',
    warning: 'bg-status-warning-bg text-status-warning',
    info: 'bg-status-info-bg text-status-info',
  };

  return (
    <Card className={clsx('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-charcoal-subtle uppercase tracking-wider">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-charcoal">{value}</span>
            {subValue && <span className="text-xs text-charcoal-muted">{subValue}</span>}
          </div>
        </div>
        {icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBgClasses[accentColor])}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs">
          <span className={clsx('font-medium mr-1.5', trend.isPositive ? 'text-status-success' : 'text-charcoal-subtle')}>
            {trend.value}
          </span>
          <span className="text-charcoal-subtle">vs last period</span>
        </div>
      )}
    </Card>
  );
};
