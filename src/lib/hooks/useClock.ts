'use client';

import { useEffect, useState } from 'react';

/**
 * 桌面时钟：每秒更新一次当前时间。
 * 初始为 null 以避免 SSR/CSR 水合不一致，挂载后才设置真实时间。
 */
export function useClock(intervalMs = 1000): Date | null {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return currentTime;
}
