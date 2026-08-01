'use client';

import { useEffect, useRef } from 'react';
import { useSystemStore } from '@/stores';

/**
 * 系统状态轮询：在桌面挂载时标记启动完成，并以固定间隔更新 uptime。
 * 仅维护 uptime（单调递增）；cpu/内存/网络等指标交由 SystemMonitor 与
 * simulationService 写入，避免多数据源互相覆盖。
 */
export function useSystemStatusPolling(intervalMs = 5000): void {
  const setBootState = useSystemStore((s) => s.setBootState);
  const updateStatus = useSystemStore((s) => s.updateStatus);
  const bootTimeRef = useRef(Date.now());

  useEffect(() => {
    setBootState(false, 100, 'complete');
    bootTimeRef.current = Date.now();

    const updateUptime = () => {
      updateStatus({ uptime: Math.floor((Date.now() - bootTimeRef.current) / 1000) });
    };

    updateUptime();
    const interval = setInterval(updateUptime, intervalMs);
    return () => clearInterval(interval);
  }, [setBootState, updateStatus, intervalMs]);
}
