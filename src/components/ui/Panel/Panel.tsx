import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: 'cyan' | 'orange' | 'red' | 'green';
  title?: string;
  actions?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  children,
  className,
  glow = false,
  glowColor = 'cyan',
  title,
  actions,
}) => {
  const glowColors = {
    cyan: 'shadow-neon',
    orange: 'shadow-neon-orange',
    red: 'shadow-neon-red',
    green: 'shadow-neon-green',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'glass-panel',
          glow && glowColors[glowColor],
          className
        )
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-moss-cyan/20">
          <h3 className="font-mono text-sm font-semibold text-moss-cyan tracking-wider uppercase">
            {title}
          </h3>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
