'use client';

import { useEffect, useState, useCallback, useRef, type DependencyList } from 'react';

/**
 * 通用异步初始化 hook。
 *
 * 解决 issue #27 中 5 处 `useEffect(() => { setLoading(true); await initDefault(); const data = await getAll(); setData(data); setLoading(false); }, [])` 重复：
 * - LogViewer / AlertSystem / TaskScheduler / AIDecisionCenter / FileExplorer
 *
 * 用法：
 * ```ts
 * const { data, loading, refresh } = useAsyncInit(async () => {
 *   await initDefaultTasks();
 *   return getTasks();
 * }, []);
 * ```
 *
 * - `initFn`：返回初始化后的数据（建议在内部完成 initDefault + 拉取）。
 * - `deps`：依赖列表，变化时重新执行（默认只执行一次）。
 * - `refresh`：手动重新执行初始化，便于“刷新”按钮复用。
 */
export function useAsyncInit<T>(
  initFn: () => Promise<T>,
  deps: DependencyList = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setData: (data: T | null) => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // 用 ref 持有最新 initFn，避免依赖变化导致的闭包陈旧；同时不把它放进 deps
  const initFnRef = useRef(initFn);
  initFnRef.current = initFn;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await initFnRef.current();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refresh: run, setData };
}
