'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSystemStore } from '@/stores';
import { FileManager } from '@/components/file-manager';
import { TaskScheduler } from '@/components/task-scheduler';
import { AIDecisionCenter } from '@/components/ai-system';
import { LogViewer, AlertSystem } from '@/components/system';
import { Button } from '@/components/ui';
import {
  FolderOpen,
  Activity,
  Brain,
  Terminal,
  Bell,
  Settings,
  Grid,
  LayoutGrid,
} from 'lucide-react';

type AppType = 'file-manager' | 'task-scheduler' | 'ai-center' | 'log-viewer' | 'alert-system';

const appConfig = {
  'file-manager': {
    title: '文件管理器',
    icon: <FolderOpen className="w-5 h-5" />,
    component: FileManager,
    defaultSize: { width: 900, height: 600 },
  },
  'task-scheduler': {
    title: '任务调度器',
    icon: <Activity className="w-5 h-5" />,
    component: TaskScheduler,
    defaultSize: { width: 800, height: 600 },
  },
  'ai-center': {
    title: 'AI决策中心',
    icon: <Brain className="w-5 h-5" />,
    component: AIDecisionCenter,
    defaultSize: { width: 1000, height: 700 },
  },
  'log-viewer': {
    title: '系统日志',
    icon: <Terminal className="w-5 h-5" />,
    component: LogViewer,
    defaultSize: { width: 900, height: 500 },
  },
  'alert-system': {
    title: '系统警报',
    icon: <Bell className="w-5 h-5" />,
    component: AlertSystem,
    defaultSize: { width: 600, height: 400 },
  },
};

export default function DesktopPage() {
  const { setBootState, updateStatus, openWindow, closeWindow, focusWindow, windows, activeWindowId } =
    useSystemStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // 初始化
  useEffect(() => {
    setBootState(false, 100, 'complete');

    // 更新系统状态
    const statusInterval = setInterval(() => {
      updateStatus({
        cpu: Math.random() * 100,
        memory: {
          total: 8192,
          used: Math.random() * 6000 + 1000,
          free: 2000,
          percentage: Math.random() * 70 + 10,
        },
        disk: {
          total: 256,
          used: 120 + Math.random() * 20,
          free: 116,
          percentage: 50,
        },
        network: {
          upload: Math.random() * 1000,
          download: Math.random() * 2000,
        },
        uptime: Math.floor(Math.random() * 86400),
      });
    }, 2000);

    // 更新时间
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(timeInterval);
    };
  }, [setBootState, updateStatus]);

  // 打开应用
  const handleOpenApp = (appType: AppType) => {
    const config = appConfig[appType];
    openWindow({
      title: config.title,
      type: appType,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 },
      size: config.defaultSize,
    });
    setStartMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 bg-gradient-cyber-gradient overflow-hidden"
    >
      {/* 桌面背景网格 */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* 桌面内容区域 */}
      <div className="relative z-10 h-full flex flex-col">
        {/* 主桌面区域 - 窗口容器 */}
        <div className="flex-1 relative">
          {/* 桌面图标 */}
          <div className="absolute top-4 left-4 space-y-4">
            {Object.entries(appConfig).map(([key, config]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenApp(key as AppType)}
                className="flex flex-col items-center gap-2 p-4 rounded border border-transparent hover:border-moss-cyan/30 hover:bg-moss-cyan/5 transition-all"
              >
                <div className="text-moss-cyan">{config.icon}</div>
                <span className="text-xs text-moss-white/80">{config.title}</span>
              </motion.button>
            ))}
          </div>

          {/* 窗口区域 */}
          {windows.map((window) => {
            const config = appConfig[window.type as AppType];
            if (!config) return null;

            const AppComponent = config.component;
            const isActive = activeWindowId === window.id;

            return (
              <motion.div
                key={window.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`absolute glass-panel ${
                  isActive ? 'ring-2 ring-moss-cyan shadow-neon-strong' : ''
                }`}
                style={{
                  left: window.position.x,
                  top: window.position.y,
                  width: window.size.width,
                  height: window.size.height,
                  zIndex: window.zIndex,
                }}
                onClick={() => focusWindow(window.id)}
              >
                {/* 窗口标题栏 */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-moss-cyan/20 cursor-move">
                  <div className="flex items-center gap-2">
                    <div className="text-moss-cyan">{config.icon}</div>
                    <span className="font-mono text-sm text-moss-white">
                      {window.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 hover:bg-moss-cyan/10 rounded"
                      onClick={() => focusWindow(window.id)}
                    >
                      <LayoutGrid className="w-3 h-3 text-moss-white/60" />
                    </button>
                    <button
                      className="p-1 hover:bg-cyber-red/10 rounded"
                      onClick={() => closeWindow(window.id)}
                    >
                      <span className="text-cyber-red text-xs">×</span>
                    </button>
                  </div>
                </div>

                {/* 窗口内容 */}
                <div className="p-2 h-[calc(100%-40px)] overflow-auto">
                  <AppComponent />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 底部任务栏 */}
        <div className="h-14 bg-dark-900/80 backdrop-blur-md border-t border-moss-cyan/30 flex items-center justify-between px-6">
          {/* 左侧：开始按钮 */}
          <div className="relative">
            <Button
              variant="primary"
              onClick={() => setStartMenuOpen(!startMenuOpen)}
              className="font-display tracking-wider"
            >
              <Grid className="w-4 h-4 mr-2" />
              MOSS
            </Button>

            {/* 开始菜单 */}
            {startMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-2 glass-panel p-4 min-w-64"
              >
                <h3 className="font-mono text-xs text-moss-cyan mb-3">应用</h3>
                <div className="space-y-1">
                  {Object.entries(appConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleOpenApp(key as AppType)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-moss-cyan/10 transition-colors"
                    >
                      <div className="text-moss-cyan">{config.icon}</div>
                      <span className="text-sm text-moss-white">{config.title}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* 中间：运行的应用 */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {windows.map((window) => {
              const config = appConfig[window.type as AppType];
              if (!config) return null;

              return (
                <button
                  key={window.id}
                  onClick={() => focusWindow(window.id)}
                  className={`
                    px-3 py-1.5 font-mono text-xs border transition-all
                    ${
                      activeWindowId === window.id
                        ? 'border-moss-cyan bg-moss-cyan/20 text-moss-white'
                        : 'border-moss-white/20 text-moss-white/60 hover:border-moss-cyan/30'
                    }
                  `}
                >
                  {config.title}
                </button>
              );
            })}
          </div>

          {/* 右侧：系统托盘 */}
          <div className="flex items-center gap-4">
            <div className="text-moss-white/60 font-mono text-xs">
              {currentTime.toLocaleTimeString('zh-CN')}
            </div>
            <div className="text-moss-white/40 font-mono text-xs">
              {currentTime.toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>
      </div>

      {/* 点击空白处关闭开始菜单 */}
      {startMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setStartMenuOpen(false)}
        />
      )}
    </motion.div>
  );
}
