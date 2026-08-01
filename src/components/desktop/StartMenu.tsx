'use client';

import React, { memo } from 'react';

import { motion } from 'framer-motion';

import { appConfig, type AppType } from './appConfig';

interface StartMenuProps {
  open: boolean;
  onOpenApp: (appType: AppType) => void;
}

/**
 * 开始菜单（issue #31：从 Taskbar.tsx 抽离为独立组件）。
 *
 * 仅负责菜单的渲染与点击触发应用打开；开关状态由父组件控制。
 */
export const StartMenu = memo(function StartMenu({ open, onOpenApp }: StartMenuProps) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-full left-0 mb-2 glass-panel p-4 min-w-64"
    >
      <h3 className="font-mono text-xs text-moss-cyan mb-3">应用</h3>
      <div className="space-y-1">
        {Object.entries(appConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onOpenApp(key as AppType)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-moss-cyan/10 transition-colors"
          >
            <div className="text-moss-cyan">{config.icon}</div>
            <span className="text-sm text-moss-white">{config.title}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
});
