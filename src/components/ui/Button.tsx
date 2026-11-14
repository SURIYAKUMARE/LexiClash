import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-brand-600 disabled:opacity-50 disabled:cursor-not-allowed select-none text-xs';

  const variantClasses = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white border border-brand-700 active:bg-brand-800 shadow-xs',
    secondary: 'bg-surface-muted dark:bg-surface-dark-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-charcoal dark:text-slate-200 border border-surface-border dark:border-surface-dark-border',
    outline: 'border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-200 hover:bg-surface-subtle dark:hover:bg-surface-dark-muted',
    danger: 'bg-status-danger hover:bg-red-700 text-white border border-red-700 shadow-xs',
    ghost: 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-white hover:bg-surface-muted dark:hover:bg-surface-dark-muted',
    success: 'bg-status-success hover:bg-emerald-700 text-white border border-emerald-700 shadow-xs',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 gap-1.5 text-xs',
    md: 'px-3.5 py-2 gap-2 text-xs',
    lg: 'px-4 py-2.5 gap-2.5 text-sm',
  };

  return (
    <button
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
