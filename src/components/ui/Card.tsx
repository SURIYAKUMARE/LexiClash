import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-surface rounded-xl border border-surface-border p-5 shadow-subtle transition-all',
        hoverable && 'hover:shadow-card hover:border-brand-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
