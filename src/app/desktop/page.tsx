'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSystemStore } from '@/stores';
import { DesktopIcons, WindowManager, Taskbar, type AppType, appConfig } from '@/components/desktop';

export default function DesktopPage() {
  const { setBootState, updateStatus, openWindow } = useSystemStore();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

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
    }, 2000);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 bg-gradient-cyber-gradient overflow-hidden"
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
    </motion.div>
  );
}