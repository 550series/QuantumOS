import { describe, it, expect, vi, beforeEach } from 'vitest';

// mock web-vitals 的 on* 注册函数，捕获传入的 reporter 回调
const onLCP = vi.fn();
const onFCP = vi.fn();
const onCLS = vi.fn();
const onINP = vi.fn();
const onTTFB = vi.fn();

vi.mock('web-vitals', () => ({
  onLCP,
  onFCP,
  onCLS,
  onINP,
  onTTFB,
}));

describe('initWebVitals', () => {
  beforeEach(() => {
    onLCP.mockClear();
    onFCP.mockClear();
    onCLS.mockClear();
    onINP.mockClear();
    onTTFB.mockClear();
    // 重置模块内 initialized 标志
    vi.resetModules();
  });

  it('registers all five metrics on first call', async () => {
    const { initWebVitals } = await import('@/lib/monitoring/webVitals');
    initWebVitals();

    expect(onLCP).toHaveBeenCalledOnce();
    expect(onFCP).toHaveBeenCalledOnce();
    expect(onCLS).toHaveBeenCalledOnce();
    expect(onINP).toHaveBeenCalledOnce();
    expect(onTTFB).toHaveBeenCalledOnce();
  });

  it('is idempotent: second call does not re-register', async () => {
    const { initWebVitals } = await import('@/lib/monitoring/webVitals');
    initWebVitals();
    initWebVitals();

    expect(onLCP).toHaveBeenCalledOnce();
    expect(onTTFB).toHaveBeenCalledOnce();
  });

  it('passes the custom reporter to each on* registration', async () => {
    const { initWebVitals } = await import('@/lib/monitoring/webVitals');
    const reporter = vi.fn();
    initWebVitals(reporter);

    // 每个 on* 都应收到同一个 reporter 函数
    expect(onLCP).toHaveBeenCalledWith(reporter);
    expect(onFCP).toHaveBeenCalledWith(reporter);
    expect(onCLS).toHaveBeenCalledWith(reporter);
    expect(onINP).toHaveBeenCalledWith(reporter);
    expect(onTTFB).toHaveBeenCalledWith(reporter);
  });

  it('default reporter logs the metric via console.warn', async () => {
    const { initWebVitals } = await import('@/lib/monitoring/webVitals');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    initWebVitals();

    // 取出传给 onLCP 的默认 reporter 并手动触发
    const defaultReporter = onLCP.mock.calls[0][0];
    defaultReporter({
      name: 'LCP',
      value: 1200,
      rating: 'good',
      id: 'l1',
      delta: 0,
    } as never);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[web-vitals] LCP'),
      expect.objectContaining({ name: 'LCP', value: 1200 }),
    );
    warnSpy.mockRestore();
  });

  it('default reporter dedupes: same metric name only reported once', async () => {
    const { initWebVitals } = await import('@/lib/monitoring/webVitals');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    initWebVitals();

    const defaultReporter = onLCP.mock.calls[0][0];
    const metric = { name: 'CLS', value: 0.1, rating: 'good', id: 'c1', delta: 0.1 } as never;
    defaultReporter(metric);
    defaultReporter(metric); // 重复触发

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
