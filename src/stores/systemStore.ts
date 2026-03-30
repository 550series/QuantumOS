import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Window, SystemStatus, SystemConfig, Notification } from '@/types';
import { defaultSettings } from '@/lib/db';

interface SystemState {
  // 系统状态
  status: SystemStatus;
  config: SystemConfig;

  // 窗口管理
  windows: Window[];
  activeWindowId: string | null;

  // 通知
  notifications: Notification[];

  // 启动状态
  isBooting: boolean;
  bootProgress: number;
  bootStage: string;

  // 操作方法
  updateStatus: (status: Partial<SystemStatus>) => void;
  updateConfig: (config: Partial<SystemConfig>) => void;

  // 窗口操作
  openWindow: (window: Omit<Window, 'id' | 'zIndex'>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;

  // 通知操作
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // 启动操作
  setBootState: (isBooting: boolean, progress?: number, stage?: string) => void;
}

export const useSystemStore = create<SystemState>()(
  immer((set, get) => ({
    // 初始状态
    status: {
      uptime: 0,
      cpu: 0,
      memory: {
        total: 8192,
        used: 0,
        free: 8192,
        percentage: 0,
      },
      disk: {
        total: 256,
        used: 0,
        free: 256,
        percentage: 0,
      },
      network: {
        upload: 0,
        download: 0,
      },
    },
    config: defaultSettings,
    windows: [],
    activeWindowId: null,
    notifications: [],
    isBooting: true,
    bootProgress: 0,
    bootStage: 'init',

    // 状态更新
    updateStatus: (status) =>
      set((state) => {
        state.status = { ...state.status, ...status };
      }),

    updateConfig: (config) =>
      set((state) => {
        state.config = { ...state.config, ...config };
      }),

    // 窗口操作
    openWindow: (window) => {
      const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const maxZIndex = Math.max(0, ...get().windows.map((w) => w.zIndex));

      set((state) => {
        state.windows.push({
          ...window,
          id,
          zIndex: maxZIndex + 1,
        });
        state.activeWindowId = id;
      });

      return id;
    },

    closeWindow: (id) =>
      set((state) => {
        state.windows = state.windows.filter((w) => w.id !== id);
        if (state.activeWindowId === id) {
          state.activeWindowId = state.windows.length > 0 ? state.windows[state.windows.length - 1].id : null;
        }
      }),

    minimizeWindow: (id) =>
      set((state) => {
        const window = state.windows.find((w) => w.id === id);
        if (window) {
          window.isMinimized = true;
        }
      }),

    maximizeWindow: (id) =>
      set((state) => {
        const window = state.windows.find((w) => w.id === id);
        if (window) {
          window.isMaximized = !window.isMaximized;
        }
      }),

    focusWindow: (id) =>
      set((state) => {
        const maxZIndex = Math.max(0, ...state.windows.map((w) => w.zIndex));
        const window = state.windows.find((w) => w.id === id);
        if (window) {
          window.zIndex = maxZIndex + 1;
          window.isMinimized = false;
        }
        state.activeWindowId = id;
      }),

    updateWindowPosition: (id, position) =>
      set((state) => {
        const window = state.windows.find((w) => w.id === id);
        if (window) {
          window.position = position;
        }
      }),

    updateWindowSize: (id, size) =>
      set((state) => {
        const window = state.windows.find((w) => w.id === id);
        if (window) {
          window.size = size;
        }
      }),

    // 通知操作
    addNotification: (notification) =>
      set((state) => {
        state.notifications.unshift({
          ...notification,
          id: `notification-${Date.now()}`,
          timestamp: new Date(),
          read: false,
        });
        // 只保留最新的50条通知
        if (state.notifications.length > 50) {
          state.notifications = state.notifications.slice(0, 50);
        }
      }),

    markNotificationRead: (id) =>
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (notification) {
          notification.read = true;
        }
      }),

    clearNotifications: () =>
      set((state) => {
        state.notifications = [];
      }),

    // 启动操作
    setBootState: (isBooting, progress, stage) =>
      set((state) => {
        state.isBooting = isBooting;
        if (progress !== undefined) state.bootProgress = progress;
        if (stage !== undefined) state.bootStage = stage;
      }),
  }))
);
