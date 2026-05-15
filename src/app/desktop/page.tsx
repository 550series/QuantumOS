'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/stores';
import { DesktopIcons, WindowManager, Taskbar, type AppType, appConfig, ContextMenu } from '@/components/desktop';
import { LockScreen } from '@/components/lock/LockScreen';

export default function DesktopPage() {
  const { setBootState, updateStatus, openWindow, addNotification } = useSystemStore();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    setBootState(false, 100, 'complete');

    const statusInterval = setInterval(() => {
      updateStatus({
        cpu: Math.random() * 100,
        memory: {
          total: 8192,
          used: Math.random() * 6000 + 1000,
          free: 2000,
          percentage: Math.random() * 70 + 10,
        },
        disk: {
          total: 256,
          used: 120 + Math.random() * 20,
          free: 116,
          percentage: 50,
        },
        network: {
          upload: Math.random() * 1000,
          download: Math.random() * 2000,
        },
        uptime: Math.floor(Math.random() * 86400),
      });
    }, 5000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(timeInterval);
    };
  }, [setBootState, updateStatus]);

  const handleOpenApp = useCallback((appType: AppType) => {
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
  }, [openWindow]);

  const handleToggleStartMenu = useCallback(() => {
    setStartMenuOpen(prev => !prev);
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

  const handleNewTask = useCallback(() => {
    handleOpenApp('task-scheduler');
  }, [handleOpenApp]);

  const handleOpenTerminal = useCallback(() => {
    handleOpenApp('moss-terminal');
  }, [handleOpenApp]);

  const handleOpenSettings = useCallback(() => {
    handleOpenApp('settings');
  }, [handleOpenApp]);

  const handleOpenFileExplorer = useCallback(() => {
    handleOpenApp('file-explorer');
  }, [handleOpenApp]);

  const handleLock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
    addNotification({
      title: '系统已解锁',
      message: 'MOSS 量子操作系统已成功解锁，欢迎回来。',
      type: 'success',
    });
  }, [addNotification]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;

      const key = e.key.toLowerCase();

      if (e.ctrlKey && e.shiftKey && key === 't') {
        e.preventDefault();
        handleOpenApp('moss-terminal');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key === 'n') {
        e.preventDefault();
        handleOpenApp('notification-center');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key === 'f') {
        e.preventDefault();
        handleOpenApp('file-explorer');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key === 's') {
        e.preventDefault();
        handleOpenApp('settings');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key === 'a') {
        e.preventDefault();
        handleOpenApp('ai-center');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key === 'j') {
        e.preventDefault();
        handleOpenApp('task-scheduler');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key === 'l') {
        e.preventDefault();
        handleOpenApp('log-viewer');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key === 'm') {
        e.preventDefault();
        handleOpenApp('system-monitor');
        return;
      }

      if (e.ctrlKey && e.shiftKey && key === 'k') {
        e.preventDefault();
        setIsLocked(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, handleOpenApp]);

  return (
    <>
      <AnimatePresence>
        {isLocked && <LockScreen onUnlock={handleUnlock} />}
      </AnimatePresence>

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
          <div
            className="fixed inset-0 z-0"
            onClick={() => setStartMenuOpen(false)}
          />
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={handleCloseContextMenu}
            onRefresh={handleRefresh}
            onNewTask={handleNewTask}
            onOpenTerminal={handleOpenTerminal}
            onOpenSettings={handleOpenSettings}
            onOpenFileExplorer={handleOpenFileExplorer}
            onLock={handleLock}
          />
        )}
      </motion.div>
    </>
  );
}