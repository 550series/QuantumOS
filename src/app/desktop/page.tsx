'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/stores';
import {
  DesktopIcons,
  WindowManager,
  Taskbar,
  type AppType,
  appConfig,
  ContextMenu,
} from '@/components/desktop';
import { LockScreen } from '@/components/lock/LockScreen';
import { useClock } from '@/lib/hooks/useClock';
import { useSystemStatusPolling } from '@/lib/hooks/useSystemStatusPolling';
import { useDesktopShortcuts } from '@/lib/hooks/useDesktopShortcuts';

export default function DesktopPage() {
  const { openWindow, addNotification, isLocked, setLocked } = useSystemStore();
  const currentTime = useClock();
  useSystemStatusPolling();

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleOpenApp = useCallback(
    (appType: AppType) => {
      const config = appConfig[appType];
      openWindow({
        title: config.title,
        type: appType,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 },
        size: config.defaultSize,
      });
      setStartMenuOpen(false);
    },
    [openWindow],
  );

  useDesktopShortcuts(handleOpenApp);

  const handleToggleStartMenu = useCallback(() => {
    setStartMenuOpen((prev) => !prev);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleRefresh = useCallback(() => {
    addNotification({
      title: '桌面刷新',
      message: '桌面环境已刷新',
      type: 'info',
    });
  }, [addNotification]);

  const handleUnlock = useCallback(() => {
    setLocked(false);
    addNotification({
      title: '系统已解锁',
      message: 'MOSS 量子操作系统已成功解锁，欢迎回来。',
      type: 'success',
    });
  }, [addNotification, setLocked]);

  return (
    <>
      <AnimatePresence>{isLocked && <LockScreen onUnlock={handleUnlock} />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 bg-gradient-cyber-gradient overflow-hidden"
        onContextMenu={handleContextMenu}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 relative">
            <DesktopIcons onOpenApp={handleOpenApp} />
            <WindowManager />
          </div>

          <Taskbar
            currentTime={currentTime}
            startMenuOpen={startMenuOpen}
            onToggleStartMenu={handleToggleStartMenu}
            onOpenApp={handleOpenApp}
          />
        </div>

        {startMenuOpen && (
          <div className="fixed inset-0 z-0" onClick={() => setStartMenuOpen(false)} />
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={handleCloseContextMenu}
            onRefresh={handleRefresh}
            onNewTask={() => handleOpenApp('task-scheduler')}
            onOpenTerminal={() => handleOpenApp('moss-terminal')}
            onOpenSettings={() => handleOpenApp('settings')}
            onOpenFileExplorer={() => handleOpenApp('file-explorer')}
            onLock={() => setLocked(true)}
          />
        )}
      </motion.div>
    </>
  );
}
