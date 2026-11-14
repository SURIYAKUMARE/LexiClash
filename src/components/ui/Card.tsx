import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-surface dark:bg-surface-dark rounded-lg border border-surface-border dark:border-surface-dark-border p-5 transition-colors',
        hoverable && 'hover:border-slate-300 dark:hover:border-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
