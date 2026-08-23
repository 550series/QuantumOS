'use client';

import { useEffect, useRef } from 'react';

import { SoundManager, setSoundEnabled } from '@/lib/sound';
import { useSystemStore } from '@/stores';

/**
 * issue #48：全局音效协调器。
 * - 监听 soundEnabled 开关
 * - 新通知到达时播放通知音/告警音
 * - 窗口打开/关闭时播放界面音效
 * 无需渲染内容，仅作为副作用挂载在布局中。
 */
export const SoundEffects: React.FC = () => {
  const soundEnabled = useSystemStore((s) => s.config.soundEnabled);
  const notifications = useSystemStore((s) => s.notifications);
  const windows = useSystemStore((s) => s.windows);

  const lastNotificationId = useRef<string | null>(null);
  const windowIds = useRef<Set<string>>(new Set());

  // 同步开关
  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // 新通知提醒
  useEffect(() => {
    const latest = notifications[0];
    if (!latest) return;
    if (lastNotificationId.current === latest.id) return;
    lastNotificationId.current = latest.id;

    if (latest.type === 'error') {
      SoundManager.alert();
    } else if (latest.type === 'warning') {
      SoundManager.warning();
    } else {
      SoundManager.notification();
    }
  }, [notifications]);

  // 窗口开合音效
  useEffect(() => {
    const next = new Set(windows.map((w) => w.id));
    const previous = windowIds.current;

    for (const id of Array.from(next)) {
      if (!previous.has(id)) SoundManager.openWindow();
    }
    for (const id of Array.from(previous)) {
      if (!next.has(id)) SoundManager.closeWindow();
    }

    windowIds.current = next;
  }, [windows]);

  return null;
};