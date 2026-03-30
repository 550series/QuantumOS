import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-mono font-medium transition-all duration-300 relative overflow-hidden';

  const variants = {
    primary: [
      'bg-transparent border border-moss-cyan text-moss-cyan',
      'hover:bg-moss-cyan hover:text-moss-blue',
      'active:scale-95',
      'shadow-neon hover:shadow-neon-strong',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-moss-cyan',
    ],
    secondary: [
      'bg-moss-cyan/10 border border-moss-cyan/50 text-moss-white',
      'hover:bg-moss-cyan/20 hover:border-moss-cyan',
      'active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
    danger: [
      'bg-transparent border border-cyber-red text-cyber-red',
      'hover:bg-cyber-red hover:text-moss-white',
      'active:scale-95',
      'shadow-neon-red hover:shadow-neon-red',
    ],
    ghost: [
      'bg-transparent border border-transparent text-moss-cyan',
      'hover:bg-moss-cyan/10',
      'active:scale-95',
    ],
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'cursor-wait',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className={isLoading ? 'invisible' : ''}>{children}</span>
    </button>
  );
};
