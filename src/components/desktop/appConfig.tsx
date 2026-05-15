import React from 'react';
import { Activity, Brain, Terminal, Bell, Settings, AlertCircle, FolderOpen } from 'lucide-react';
import { TaskScheduler } from '@/components/task-scheduler';
import { AIDecisionCenter } from '@/components/ai-system';
import { LogViewer, AlertSystem, EventMonitor, SystemMonitor, NotificationCenter } from '@/components/system';
import { SimulationPanel } from '@/components/simulation';
import { MossTerminal } from '@/components/terminal';
import { FileExplorer } from '@/components/file-explorer';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export type AppType =
  | 'task-scheduler'
  | 'ai-center'
  | 'log-viewer'
  | 'alert-system'
  | 'settings'
  | 'simulation'
  | 'event-monitor'
  | 'system-monitor'
  | 'notification-center'
  | 'moss-terminal'
  | 'file-explorer';

export interface AppConfigEntry {
  title: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  defaultSize: { width: number; height: number };
}

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
    component: SettingsPanel,
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
  'notification-center': {
    title: '通知中心',
    icon: <Bell className="w-5 h-5" />,
    component: NotificationCenter,
    defaultSize: { width: 450, height: 500 },
  },
  'moss-terminal': {
    title: 'MOSS终端',
    icon: <Terminal className="w-5 h-5" />,
    component: MossTerminal,
    defaultSize: { width: 700, height: 500 },
  },
  'file-explorer': {
    title: '文件浏览器',
    icon: <FolderOpen className="w-5 h-5" />,
    component: FileExplorer,
    defaultSize: { width: 700, height: 500 },
  },
};