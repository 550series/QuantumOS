'use client';

import { useEffect } from 'react';

import { useSystemStore } from '@/stores';

/**
 * 系统状态轮询 hook（issue #31：从 desktop/page.tsx 抽离）。
 *
 * - 在桌面挂载时：结束开机流程（setBootState false/100/complete）。
 * - 每 5s 更新 uptime（单调递增，由桌面单一维护；cpu/内存/网络等指标
 *   交由 SystemMonitor 与 simulationService 写入，避免多数据源互相覆盖）。
 *
 * @param interval 轮询间隔（ms），默认 5000
 */
export function useSystemStatusPolling(interval = 5000): void {
  const setBootState = useSystemStore((s) => s.setBootState);
  const updateStatus = useSystemStore((s) => s.updateStatus);

  useEffect(() => {
    setBootState(false, 100, 'complete');

    const bootTime = Date.now();
    const updateUptime = () => {
      updateStatus({ uptime: Math.floor((Date.now() - bootTime) / 1000) });
    };

    updateUptime();
    const timer = setInterval(updateUptime, interval);

    return () => clearInterval(timer);
  }, [setBootState, updateStatus, interval]);
}
