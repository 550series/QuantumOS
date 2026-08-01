/**
 * 监控上报基建（issue #30）。
 *
 * 当前仅输出到 console，保留上报接口形状，便于后续接入 Sentry / 自建埋点。
 * - `reportError`：ErrorBoundary.componentDidCatch 调用，上报渲染异常 + 组件栈。
 * - `reportMetric`：web-vitals 调用，上报 LCP/FCP/INP/CLS/TTFB 等性能指标。
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string | null;
  timestamp: string;
  url?: string;
}

export interface MetricReport {
  name: string;
  value: number;
  rating?: string;
  id: string;
  delta?: number;
  navigationType?: string;
  timestamp: string;
}

function safeUrl(): string | undefined {
  if (typeof window !== 'undefined') return window.location.href;
  return undefined;
}

/**
 * 上报运行时 / 渲染异常。
 * 在 ErrorBoundary.componentDidCatch 中调用。
 */
export function reportError(error: Error, componentStack?: string | null): void {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    componentStack,
    timestamp: new Date().toISOString(),
    url: safeUrl(),
  };

  // 当前阶段输出到 console；接入 Sentry 时替换为 Sentry.captureException(error, { contexts: ... })
  console.error('[monitoring] reportError', report);
}

/**
 * 上报单个 web-vitals 指标。
 */
export function reportMetric(
  metric: Omit<MetricReport, 'timestamp'> & { rating?: string }
): void {
  const report: MetricReport = {
    ...metric,
    timestamp: new Date().toISOString(),
  };

  // 当前阶段输出到 console；接入埋点时替换为 navigator.sendBeacon / fetch 上报
  console.warn('[monitoring] reportMetric', report);
}
