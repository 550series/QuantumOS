'use client';

import React from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SelectableCardProps extends MotionProps {
  /** 是否处于选中态 */
  selected?: boolean;
  /** 点击回调（通常用于切换选中项） */
  onClick?: () => void;
  children: React.ReactNode;
  /** 未选中态的附加样式（如边框/悬停色），选中态样式会通过 twMerge 覆盖 */
  className?: string;
  /** 选中态样式，默认为青色高亮 */
  selectedClassName?: string;
}

const DEFAULT_SELECTED = 'border-moss-cyan bg-moss-cyan/10 shadow-neon';

/**
 * 可选中卡片，统一各列表项「点击选中 + 高亮」的视觉与交互模式。
 */
export const SelectableCard: React.FC<SelectableCardProps> = ({
  selected,
  onClick,
  children,
  className,
  selectedClassName,
  initial = { opacity: 0, y: 10 },
  animate = { opacity: 1, y: 0 },
  ...rest
}) => (
  <motion.div
    initial={initial}
    animate={animate}
    onClick={onClick}
    className={twMerge(
      clsx(
        'border rounded p-3 cursor-pointer transition-all',
        className,
        selected && (selectedClassName ?? DEFAULT_SELECTED),
      ),
    )}
    {...rest}
  >
    {children}
  </motion.div>
);
