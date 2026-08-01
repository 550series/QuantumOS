'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 统一「挂载时异步初始化 + 手动刷新」模式，替代各组件中重复的：
 *
 * ```ts
 * useEffect(() => {
 *   (async () => {
 *     setLoading(true);
 *     await initDefault();
 *     const data = await getAll();
 *     setData(data);
 *     setLoading(false);
 *   })();
 * }, []);
 * ```
 *
 * `initFn` 内部负责写入组件自有状态/Store，hook 仅负责触发与 loading 跟踪。
 * 返回的 `refresh` 可在变更后复用，避免每个 handler 都重复「mutate -> 全量重拉」。
 */
export function useAsyncInit(
  initFn: () => Promise<void> | void,
  deps: React.DependencyList = [],
): { loading: boolean; refresh: () => Promise<void> } {
  const [loading, setLoading] = useState(true);
  // 用 ref 持有最新 initFn，避免其身份变化触发额外 effect，同时保证调用的是最新闭包。
  const initRef = useRef(initFn);
  initRef.current = initFn;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await initRef.current();
    } catch (err) {
      console.error('useAsyncInit refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        await initRef.current();
      } catch (err) {
        console.error('useAsyncInit init failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // 仅在指定 deps 变化时重新执行；initFn 身份通过 ref 跟踪，不作为依赖。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { loading, refresh };
}
