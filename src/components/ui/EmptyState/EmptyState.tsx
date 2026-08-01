import React from 'react';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { LucideIcon } from 'lucide-react';

/**
 * 空状态占位组件。
 *
 * 解决 issue #27 中 6 处 `flex flex-col items-center justify-center ... 暂无X` 重复。
 * FileExplorer / LogViewer / AlertSystem / TaskScheduler / EventMonitor / NotificationCenter 均可复用。
 */
export interface EmptyStateProps {
  /** 主图标组件引用 */
  icon?: LucideIcon;
  /** 主文案，例如“暂无日志记录” */
  message: string;
  /** 可选副文案 */
  description?: string;
  /** 图标尺寸 class，默认 `w-12 h-12` */
  iconClassName?: string;
  /** 容器自定义 class */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  message,
  description,
  iconClassName = 'w-12 h-12',
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center text-moss-white/40',
          className
        )
      )}
    >
      {Icon && <Icon className={twMerge(clsx('mb-2 opacity-40', iconClassName))} />}
      <p className="font-mono text-sm">{message}</p>
      {description && (
        <p className="font-mono text-xs mt-1 text-moss-white/30">{description}</p>
      )}
    </div>
  );
};
