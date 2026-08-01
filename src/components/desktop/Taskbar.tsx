'use client';

import React, { memo } from 'react';
import { Grid } from 'lucide-react';
import { Button } from '@/components/ui';
import { useSystemStore } from '@/stores';
import { appConfig, type AppType } from './appConfig';
import { StartMenu } from './StartMenu';

interface TaskbarProps {
  currentTime: Date | null;
  startMenuOpen: boolean;
  onToggleStartMenu: () => void;
  onOpenApp: (appType: AppType) => void;
}

export const Taskbar = memo(function Taskbar({
  currentTime,
  startMenuOpen,
  onToggleStartMenu,
  onOpenApp,
}: TaskbarProps) {
  const { windows, activeWindowId, focusWindow, status } = useSystemStore();

  return (
    <div className="h-14 bg-dark-900/80 backdrop-blur-md border-t border-moss-cyan/30 flex items-center justify-between px-6">
      <div className="relative">
        <Button
          variant="primary"
          onClick={onToggleStartMenu}
          className="font-display tracking-wider"
        >
          <Grid className="w-4 h-4 mr-2" />
          MOSS
        </Button>

        {startMenuOpen && <StartMenu onOpenApp={onOpenApp} />}
      </div>

      <div className="flex items-center gap-2 flex-1 justify-center">
        {windows.map((win) => {
          const config = appConfig[win.type as AppType];
          if (!config) return null;

          return (
            <button
              key={win.id}
              onClick={() => focusWindow(win.id)}
              className={`px-3 py-1.5 font-mono text-xs border transition-all ${
                activeWindowId === win.id
                  ? 'border-moss-cyan bg-moss-cyan/20 text-moss-white'
                  : 'border-moss-white/20 text-moss-white/60 hover:border-moss-cyan/30'
              }`}
            >
              {config.title}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-moss-white/60 font-mono text-xs">CPU: {Math.round(status.cpu)}%</div>
          <div className="text-moss-white/60 font-mono text-xs">
            MEM: {Math.round(status.memory.percentage)}%
          </div>
          <div className="text-moss-white/60 font-mono text-xs">
            NET: {Math.round(status.network.download)}KB/s
          </div>
        </div>
        <div className="text-moss-white/60 font-mono text-xs" suppressHydrationWarning>
          {currentTime ? currentTime.toLocaleTimeString('zh-CN') : '--:--:--'}
        </div>
        <div className="text-moss-white/40 font-mono text-xs" suppressHydrationWarning>
          {currentTime ? currentTime.toLocaleDateString('zh-CN') : '----/--/--'}
        </div>
      </div>
    </div>
  );
});
