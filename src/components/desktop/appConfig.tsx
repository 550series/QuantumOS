import React from 'react';
import { Activity, Brain, Terminal, Bell, Settings, AlertCircle } from 'lucide-react';
import { TaskScheduler } from '@/components/task-scheduler';
import { AIDecisionCenter } from '@/components/ai-system';
import { LogViewer, AlertSystem, EventMonitor, SystemMonitor } from '@/components/system';
import { SimulationPanel } from '@/components/simulation';

export type AppType = 'task-scheduler' | 'ai-center' | 'log-viewer' | 'alert-system' | 'settings' | 'simulation' | 'event-monitor' | 'system-monitor';

export interface AppConfigEntry {
  title: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  defaultSize: { width: number; height: number };
}

const SettingsComponent = () => (
  <div className="p-4">
    <h2 className="text-xl font-mono text-moss-cyan mb-4">系统设置</h2>
    <div className="space-y-4">
      <div className="p-3 border border-moss-cyan/30 rounded">
        <h3 className="text-sm font-mono text-moss-white mb-2">外观设置</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-moss-white/60">主题:</span>
          <select className="bg-dark-900 border border-moss-cyan/30 text-moss-white text-xs px-2 py-1 rounded">
            <option>深色主题</option>
            <option>浅色主题</option>
          </select>
        </div>
      </div>
      <div className="p-3 border border-moss-cyan/30 rounded">
        <h3 className="text-sm font-mono text-moss-white mb-2">系统设置</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-moss-white/60">自动更新:</span>
          <input type="checkbox" className="accent-moss-cyan" />
        </div>
      </div>
      <div className="p-3 border border-moss-cyan/30 rounded">
        <h3 className="text-sm font-mono text-moss-white mb-2">网络设置</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-moss-white/60">网络连接:</span>
          <span className="text-xs text-moss-green">已连接</span>
        </div>
      </div>
    </div>
  </div>
);

export const appConfig: Record<AppType, AppConfigEntry> = {
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
  'settings': {
    title: '系统设置',
    icon: <Settings className="w-5 h-5" />,
    component: SettingsComponent,
    defaultSize: { width: 600, height: 500 },
  },
  'simulation': {
    title: '模拟系统',
    icon: <Activity className="w-5 h-5" />,
    component: SimulationPanel,
    defaultSize: { width: 800, height: 600 },
  },
  'event-monitor': {
    title: '事件监控',
    icon: <AlertCircle className="w-5 h-5" />,
    component: EventMonitor,
    defaultSize: { width: 1000, height: 600 },
  },
  'system-monitor': {
    title: '系统监控',
    icon: <Activity className="w-5 h-5" />,
    component: SystemMonitor,
    defaultSize: { width: 1000, height: 600 },
  },
};