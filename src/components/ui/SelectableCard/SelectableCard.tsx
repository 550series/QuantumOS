import React from 'react';

import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

/**
 * 可选中卡片。
 *
 * 解决 issue #27 中 4 处 `border rounded p-3 cursor-pointer ... selected ? ring-2 : hover:` 同构卡片：
 * - TaskScheduler / AIDecisionCenter / EventMonitor / AlertSystem
 *
 * 通过 `selected` 控制选中态视觉，`onClick` 触发选择；内部仅承担外观与过渡，
 * 具体内容由 children 自由组合。
 */
export interface SelectableCardProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  /** 自定义边框色 class（未选中时），默认 `border-moss-cyan/20` */
  borderClassName?: string;
  /** 选中时背景 class，默认 `bg-moss-cyan/10` */
  selectedBgClassName?: string;
  /** 选中时阴影 class，默认 `shadow-neon` */
  selectedShadowClassName?: string;
  className?: string;
  /** 是否禁用进入动画，默认 false（保留 motion 进入动画） */
  disableMotion?: boolean;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  selected = false,
  onClick,
  children,
  borderClassName = 'border-moss-cyan/20 hover:border-moss-cyan/40',
  selectedBgClassName = 'bg-moss-cyan/10',
  selectedShadowClassName = 'shadow-neon',
  className,
  disableMotion = false,
}) => {
  const merged = twMerge(
    clsx(
      'border rounded p-3 cursor-pointer transition-all',
      selected
        ? clsx('border-moss-cyan', selectedBgClassName, selectedShadowClassName)
        : borderClassName,
      className
    )
  );

  if (disableMotion) {
    return (
      <div className={merged} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={merged}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
