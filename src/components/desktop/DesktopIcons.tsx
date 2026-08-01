'use client';

import React, { memo } from 'react';

import { motion } from 'framer-motion';

import { appConfig, type AppType } from './appConfig';

interface DesktopIconsProps {
  onOpenApp: (appType: AppType) => void;
}

export const DesktopIcons = memo(function DesktopIcons({ onOpenApp }: DesktopIconsProps) {
  return (
    <div className="absolute top-4 left-4 space-y-4">
      {Object.entries(appConfig).map(([key, config]) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpenApp(key as AppType)}
          className="flex flex-col items-center gap-2 p-4 rounded border border-transparent hover:border-moss-cyan/30 hover:bg-moss-cyan/5 transition-all"
        >
          <div className="text-moss-cyan">{config.icon}</div>
          <span className="text-xs text-moss-white/80">{config.title}</span>
        </motion.button>
      ))}
    </div>
  );
});