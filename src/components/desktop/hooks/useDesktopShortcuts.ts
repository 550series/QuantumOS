'use client';

import { useEffect } from 'react';

import { useSystemStore } from '@/stores';

import type { AppType } from '../appConfig';

/**
 * 快捷键配置项。
 * - `key`：主键（小写），与 Ctrl+Shift 组合。
 * - `app`：要打开的应用类型。
 */
interface ShortcutEntry {
  key: string;
  app: AppType;
}

/**
 * 桌面快捷键配置表（issue #31：把硬编码 if-else 改为数据驱动）。
 *
 * 所有快捷键均为 Ctrl+Shift+<key> 组合。
 */
const SHORTCUTS: ShortcutEntry[] = [
  { key: 't', app: 'moss-terminal' },
  { key: 'n', app: 'notification-center' },
  { key: 'f', app: 'file-explorer' },
  { key: 's', app: 'settings' },
  { key: 'a', app: 'ai-center' },
  { key: 'j', app: 'task-scheduler' },
  { key: 'l', app: 'log-viewer' },
  { key: 'm', app: 'system-monitor' },
];

/** 锁屏快捷键主键（特殊处理：不打开应用，而是触发锁屏） */
const LOCK_SHORTCUT_KEY = 'k';

export interface UseDesktopShortcutsOptions {
  /** 锁屏时是否禁用快捷键，默认 true */
  disabled?: boolean;
  /** 打开应用回调（一般透传 handleOpenApp） */
  onOpenApp: (app: AppType) => void;
  /** 锁屏回调 */
  onLock: () => void;
}

/**
 * 桌面键盘快捷键 hook（issue #31：从 desktop/page.tsx 抽离）。
 *
 * - 基于 SHORTCUTS 配置表匹配，避免长串 if-else。
 * - `disabled` 为 true（锁屏中）时不再响应任何快捷键。
 * - 所有快捷键均为 Ctrl+Shift+<key>。
 */
export function useDesktopShortcuts({
  disabled = false,
  onOpenApp,
  onLock,
}: UseDesktopShortcutsOptions): void {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 所有快捷键均需 Ctrl+Shift
      if (!e.ctrlKey || !e.shiftKey) return;

      const key = e.key.toLowerCase();

      // 锁屏快捷键
      if (key === LOCK_SHORTCUT_KEY) {
        e.preventDefault();
        onLock();
        return;
      }

      // 应用快捷键
      const entry = SHORTCUTS.find((s) => s.key === key);
      if (entry) {
        e.preventDefault();
        onOpenApp(entry.app);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onOpenApp, onLock]);
}

/**
 * 便捷 hook：自动从 store 取锁屏状态并接入快捷键。
 * 适用于 desktop/page.tsx 这种只需要“打开应用 + 锁屏”的场景。
 */
export function useDesktopShortcutsWithStore(
  onOpenApp: (app: AppType) => void,
  onLock: () => void
): void {
  const isLocked = useSystemStore((s) => s.isLocked);
  useDesktopShortcuts({ disabled: isLocked, onOpenApp, onLock });
}
