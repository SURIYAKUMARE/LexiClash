import React from 'react';
import { clsx } from 'clsx';
import { ShieldCheck, Target, AlertTriangle } from 'lucide-react';

interface CareerReadinessGaugeProps {
  score: number; // 0 to 100
  roleTitle: string;
  matchedCount?: number;
  totalRequired?: number;
  verifiedPercentage?: number;
  className?: string;
}

export const CareerReadinessGauge: React.FC<CareerReadinessGaugeProps> = ({
  score,
  roleTitle,
  matchedCount = 0,
  totalRequired = 0,
  verifiedPercentage = 0,
  className
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG circular arc calculation
  const radius = 64;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Semicircle: strokeDashoffset covers 180 deg
  const strokeDashoffset = circumference - (clampedScore / 100) * (circumference * 0.75);

  let statusLabel = 'Early Stage Alignment';
  let statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
  let strokeColor = '#d97706';

  if (clampedScore >= 80) {
    statusLabel = 'Strong Market Readiness';
    statusColor = 'text-status-success bg-status-success-bg border-emerald-200';
    strokeColor = '#059669';
  } else if (clampedScore >= 60) {
    statusLabel = 'Intermediate Competency';
    statusColor = 'text-brand-700 bg-brand-50 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-900';
    strokeColor = '#0F5C7A';
  }

  return (
    <div className={clsx('flex flex-col items-center text-center p-4', className)}>
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg height="176" width="176" className="transform -rotate-90">
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="88"
            cy="88"
          />
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="88"
            cy="88"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-extrabold tracking-tight text-charcoal">{clampedScore}%</span>
          <span className="text-xs font-medium text-charcoal-subtle uppercase tracking-wider mt-0.5">Readiness</span>
        </div>
      </div>

      <div className="mt-3">
        <h4 className="font-semibold text-charcoal text-sm">{roleTitle}</h4>
        <span className={clsx('inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border mt-1.5', statusColor)}>
          {statusLabel}
        </span>
      </div>

      {totalRequired > 0 && (
        <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-surface-border text-left">
          <div className="p-2 bg-surface-subtle rounded-lg">
            <span className="text-[11px] text-charcoal-muted block">Required Skills</span>
            <span className="text-sm font-semibold text-charcoal">{matchedCount} of {totalRequired}</span>
          </div>
          <div className="p-2 bg-surface-subtle rounded-lg">
            <span className="text-[11px] text-charcoal-muted block">Verification Rate</span>
            <span className="text-sm font-semibold text-charcoal">{verifiedPercentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
