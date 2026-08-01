'use client';

import { onCLS, onFCP, onLCP, onINP, onTTFB, type Metric } from 'web-vitals';

type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'INP' | 'TTFB';

interface Reporter {
  (metric: Metric): void;
}

const sent = new Set<string>();

/**
 * 上报单个 web-vital 指标。同一指标在会话内只上报一次（取首次有效值）。
 *
 * 当前实现使用 console.warn 输出，便于本地调试与 ErrorBoundary 日志统一。
 * 接入 Sentry/自建埋点后，将 console.warn 替换为对应 SDK 的 capture 即可。
 */
function reportMetric(metric: Metric): void {
  if (sent.has(metric.name)) return;
  sent.add(metric.name);

  // eslint-disable-next-line no-console
  console.warn(
    `[web-vitals] ${metric.name}: ${metric.value.toFixed(2)} (rating: ${metric.rating})`,
    {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      delta: metric.delta,
    },
  );
}

let initialized = false;

/**
 * 注册 web-vitals 指标采集。仅在浏览器环境执行，且整个应用生命周期只注册一次。
 *
 * 采集的指标：
 * - LCP (Largest Contentful Paint) 最大内容渲染时间
 * - FCP (First Contentful Paint) 首次内容渲染时间
 * - CLS (Cumulative Layout Shift) 累积布局偏移
 * - INP (Interaction to Next Paint) 交互到下次渲染
 * - TTFB (Time to First Byte) 首字节时间
 */
export function initWebVitals(reporter: Reporter = reportMetric): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  onLCP(reporter);
  onFCP(reporter);
  onCLS(reporter);
  onINP(reporter);
  onTTFB(reporter);
}

// 导出类型供上层扩展
export type { WebVitalName };
