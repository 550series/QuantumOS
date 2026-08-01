'use client';

import { useEffect, useState } from 'react';

/**
 * 桌面时钟 hook（issue #31：从 desktop/page.tsx 抽离）。
 *
 * - 初始为 null（避免 SSR/CSR 时间不一致导致 hydration mismatch），
 *   首次 effect 执行后写入当前时间。
 * - 每 1s 更新一次。
 *
 * @param interval 更新间隔（ms），默认 1000
 */
export function useClock(interval = 1000): Date | null {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // 首次立即写入，避免首帧显示 --:--:--
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return currentTime;
}
