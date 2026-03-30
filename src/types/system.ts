// 系统类型定义

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';
export type LogCategory = 'system' | 'operation' | 'task' | 'ai' | 'security';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  source: string;
  message: string;
  details?: Record<string, unknown>;
  stackTrace?: string;
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  parameters?: Record<string, unknown>;
}

export interface SystemStatus {
  uptime: number; // seconds
  cpu: number; // percentage
  memory: {
    total: number; // MB
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number; // GB
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    upload: number; // KB/s
    download: number;
  };
}

export interface SystemConfig {
  theme: 'dark' | 'light';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  language: string;
  autoUpdate: boolean;
}

export interface Window {
  id: string;
  title: string;
  type: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  data?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  timestamp: Date;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: string;
  };
}
