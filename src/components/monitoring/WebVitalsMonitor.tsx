'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/monitoring/webVitals';

/**
 * 客户端挂载点：注册 web-vitals 指标采集。
 * 放在根布局中，随应用首次渲染即开始采集 LCP/FCP/CLS/INP/TTFB。
 */
export function WebVitalsMonitor() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}
