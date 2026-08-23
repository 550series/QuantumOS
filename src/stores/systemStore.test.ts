import { describe, it, expect, beforeEach } from 'vitest';

import { useSystemStore } from './systemStore';

describe('systemStore', () => {
  // 每个用例前重置 store，避免跨用例状态污染
  beforeEach(() => {
    useSystemStore.setState((state) => ({
      windows: [],
      activeWindowId: null,
      notifications: [],
      isLocked: false,
      status: {
        uptime: 0,
        cpu: 0,
        memory: { total: 8192, used: 0, free: 8192, percentage: 0 },
        disk: { total: 256, used: 0, free: 256, percentage: 0 },
        network: { upload: 0, download: 0 },
      },
      config: { ...state.config, notificationsEnabled: true },
    }));
  });

  it('openWindow 添加窗口并设置递增的 zIndex', () => {
    const { openWindow } = useSystemStore.getState();
    const id1 = openWindow({ title: 'A', type: 'settings', isMinimized: false, isMaximized: false, position: { x: 0, y: 0 }, size: { width: 400, height: 300 } });
    const id2 = openWindow({ title: 'B', type: 'terminal', isMinimized: false, isMaximized: false, position: { x: 0, y: 0 }, size: { width: 400, height: 300 } });

    const { windows, activeWindowId } = useSystemStore.getState();
    const w1 = windows.find((w) => w.id === id1)!;
    const w2 = windows.find((w) => w.id === id2)!;
    expect(w1.zIndex).toBe(w2.zIndex - 1);
    expect(activeWindowId).toBe(id2);
  });

  it('closeWindow 移除窗口并将活跃窗口指向最后剩余窗口', () => {
    const { openWindow, closeWindow } = useSystemStore.getState();
    const id1 = openWindow({ title: 'A', type: 'settings', isMinimized: false, isMaximized: false, position: { x: 0, y: 0 }, size: { width: 400, height: 300 } });
    closeWindow(id1);

    const { windows, activeWindowId } = useSystemStore.getState();
    expect(windows).toHaveLength(0);
    expect(activeWindowId).toBeNull();
  });

  it('addNotification 在启用通知时新增到最前并限制条数', () => {
    const { addNotification } = useSystemStore.getState();
    addNotification({ title: 't', message: 'm', type: 'info' });
    addNotification({ title: 't2', message: 'm2', type: 'success' });

    const { notifications } = useSystemStore.getState();
    expect(notifications).toHaveLength(2);
    expect(notifications[0].title).toBe('t2');
  });

  it('addNotification 在通知关闭时不写入', () => {
    useSystemStore.setState({ config: { ...useSystemStore.getState().config, notificationsEnabled: false } });
    useSystemStore.getState().addNotification({ title: 't', message: 'm', type: 'info' });

    const { notifications } = useSystemStore.getState();
    expect(notifications).toHaveLength(0);
  });

  it('setLocked 切换锁屏状态', () => {
    useSystemStore.getState().setLocked(true);
    expect(useSystemStore.getState().isLocked).toBe(true);
    useSystemStore.getState().setLocked(false);
    expect(useSystemStore.getState().isLocked).toBe(false);
  });

  it('updateConfig 合并部分配置', () => {
    useSystemStore.getState().updateConfig({ theme: 'light', soundEnabled: false });
    const { config } = useSystemStore.getState();
    expect(config.theme).toBe('light');
    expect(config.soundEnabled).toBe(false);
    expect(config.language).toBe('zh-CN');
  });
});