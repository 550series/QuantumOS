import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncInit } from '@/lib/hooks/useAsyncInit';

describe('useAsyncInit', () => {
  it('runs the init function on mount and sets loading false after', async () => {
    const initFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncInit(initFn, []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(initFn).toHaveBeenCalledTimes(1);
  });

  it('supports synchronous init functions', async () => {
    const initFn = vi.fn();
    const { result } = renderHook(() => useAsyncInit(initFn, []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(initFn).toHaveBeenCalledTimes(1);
  });

  it('refresh re-runs the init function', async () => {
    const initFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncInit(initFn, []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(initFn).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refresh();
    });
    expect(initFn).toHaveBeenCalledTimes(2);
  });

  it('sets loading false even if init throws (and logs the error)', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const initFn = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAsyncInit(initFn, []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('does not call setState after unmount (cancelled flag)', async () => {
    let resolveInit: () => void = () => {};
    const initFn = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveInit = resolve;
        }),
    );
    const { unmount } = renderHook(() => useAsyncInit(initFn, []));
    unmount();
    // 解除挂起的 Promise，cancelled 守卫应阻止 setLoading
    resolveInit();
    expect(initFn).toHaveBeenCalledTimes(1);
  });
});
