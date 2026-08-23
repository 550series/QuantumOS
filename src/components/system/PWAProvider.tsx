'use client';

import { useEffect } from 'react';

/**
 * issue #54：注册 Service Worker，启用 PWA 离线能力。
 * 生产环境会自动注册；开发环境跳过以避免干扰热更新。
 */
export const PWAProvider: React.FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('[PWA] Service Worker 注册失败:', err);
    });
  }, []);

  return null;
};