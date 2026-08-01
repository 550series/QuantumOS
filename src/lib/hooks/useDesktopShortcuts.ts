'use client';

import { useEffect } from 'react';
import { useSystemStore } from '@/stores';
import type { AppType } from '@/components/desktop';

/**
 * 快捷键 -> 应用映射表，集中管理避免长 if-else 链。
 * 仅在 Ctrl+Shift 组合下触发。
 */
const SHORTCUT_MAP: Record<string, AppType> = {
  t: 'moss-terminal',
  n: 'notification-center',
  f: 'file-explorer',
  s: 'settings',
  a: 'ai-center',
  j: 'task-scheduler',
  l: 'log-viewer',
  m: 'system-monitor',
};

/**
 * 桌面全局快捷键：Ctrl+Shift+<key> 打开对应应用，Ctrl+Shift+K 锁屏。
 * 锁屏状态下禁用所有快捷键。
 */
export function useDesktopShortcuts(openApp: (appType: AppType) => void): void {
  const isLocked = useSystemStore((s) => s.isLocked);
  const setLocked = useSystemStore((s) => s.setLocked);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;
      if (!e.ctrlKey || !e.shiftKey) return;

      const key = e.key.toLowerCase();

      // 锁屏快捷键单独处理（不对应某个应用）
      if (key === 'k') {
        e.preventDefault();
        setLocked(true);
        return;
      }

      const appType = SHORTCUT_MAP[key];
      if (appType) {
        e.preventDefault();
        openApp(appType);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, setLocked, openApp]);
}
