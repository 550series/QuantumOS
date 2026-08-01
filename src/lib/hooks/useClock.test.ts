import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClock } from '@/lib/hooks/useClock';

afterEach(() => {
  vi.useRealTimers();
});

describe('useClock', () => {
  it('sets a Date after mount (SSR-safe initial null is flushed synchronously in jsdom)', async () => {
    const { result } = renderHook(() => useClock());
    // renderHook 通过 act 同步刷新 effect，因此挂载后即有值
    expect(result.current).toBeInstanceOf(Date);
  });

  it('updates the time on each interval tick', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const { result } = renderHook(() => useClock(1000));

    // renderHook 内部 act 会同步刷新 effect，挂载后即有初始时间
    expect(result.current).toBeInstanceOf(Date);
    const first = result.current!.getTime();

    // 推进定时器：callback 内 setCurrentTime 需在 act 中刷新
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current!.getTime()).toBeGreaterThan(first);
  });

  it('accepts a custom interval', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const { result } = renderHook(() => useClock(500));

    expect(result.current).toBeInstanceOf(Date);
    const first = result.current!.getTime();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current!.getTime()).toBeGreaterThan(first);
  });
});
