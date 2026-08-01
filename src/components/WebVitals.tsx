'use client';

import { useEffect } from 'react';

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

import { reportMetric } from '@/lib/monitoring';

/**
 * Web Vitals 采集与上报组件（issue #30）。
 *
 * 挂载到根布局后，在客户端自动采集 LCP / FCP / INP / CLS / TTFB，
 * 并通过 monitoring.reportMetric 上报。
 *
 * 该组件不渲染任何 UI，仅承担副作用。
 */
export function WebVitals(): null {
  useEffect(() => {
    const handle = (metric: Metric) => {
      reportMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        delta: metric.delta,
        navigationType: metric.navigationType,
      });
    };

    // 采集核心 Web Vitals
    onCLS(handle);
    onFCP(handle);
    onINP(handle);
    onLCP(handle);
    onTTFB(handle);
  }, []);

  return null;
}
