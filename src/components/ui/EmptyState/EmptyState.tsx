import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface EmptyStateProps {
  /** 已渲染的图标节点（由消费方控制尺寸/透明度） */
  icon?: React.ReactNode;
  /** 空状态主文案 */
  title: string;
  className?: string;
}

/**
 * 统一的空状态占位组件，替代散落在各列表组件中的「暂无 X」居中块。
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, className }) => (
  <div
    className={twMerge(
      clsx('flex flex-col items-center justify-center text-moss-white/40', className),
    )}
  >
    {icon}
    <p>{title}</p>
  </div>
);
