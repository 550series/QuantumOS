import {
  Info,
  AlertTriangle,
  AlertCircle,
  Zap,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import type { LogLevel, AlertSeverity, Notification } from '@/types';
import type { TaskStatus, TaskPriority, DecisionUrgency } from '@/types';

/**
 * 统一的严重度/状态主题映射，避免在多个组件中重复定义同类配置导致风格漂移。
 *
 * 设计约定：
 * - `icon` 为组件类型（非已渲染元素），由消费方控制尺寸，便于复用。
 * - `color` 可能包含 `animate-pulse` 等动画类，用于关键/运行中等需要强调的状态。
 */

export interface SeverityStyle {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  label: string;
}

export interface IconStyle {
  icon: LucideIcon;
  color: string;
  iconClassName?: string;
}

// LogLevel 与 AlertSeverity 共用同一套 info/warning/error/critical 语义
const severityStyles: Record<LogLevel, SeverityStyle> = {
  info: {
    icon: Info,
    color: 'text-moss-cyan',
    bg: 'bg-moss-cyan/10',
    border: 'border-moss-cyan/30',
    label: '信息',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-cyber-orange',
    bg: 'bg-cyber-orange/10',
    border: 'border-cyber-orange/30',
    label: '警告',
  },
  error: {
    icon: AlertCircle,
    color: 'text-cyber-red',
    bg: 'bg-cyber-red/10',
    border: 'border-cyber-red/30',
    label: '错误',
  },
  critical: {
    icon: Zap,
    color: 'text-cyber-red animate-pulse',
    bg: 'bg-cyber-red/20',
    border: 'border-cyber-red/50',
    label: '严重',
  },
};

// 适用于 LogLevel 与 AlertSeverity（两者枚举值同构）
export function getSeverityStyle(level: LogLevel | AlertSeverity): SeverityStyle {
  return severityStyles[level];
}

// 通知类型主题（info/success/warning/error）
const notificationTypeStyles: Record<Notification['type'], SeverityStyle> = {
  info: {
    icon: Info,
    color: 'text-moss-cyan',
    bg: 'bg-moss-cyan/10',
    border: 'border-moss-cyan/30',
    label: '信息',
  },
  success: {
    icon: CheckCircle,
    color: 'text-cyber-green',
    bg: 'bg-cyber-green/10',
    border: 'border-cyber-green/30',
    label: '成功',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-cyber-orange',
    bg: 'bg-cyber-orange/10',
    border: 'border-cyber-orange/30',
    label: '警告',
  },
  error: {
    icon: XCircle,
    color: 'text-cyber-red',
    bg: 'bg-cyber-red/10',
    border: 'border-cyber-red/30',
    label: '错误',
  },
};

export function getNotificationTypeStyle(type: Notification['type']): SeverityStyle {
  return notificationTypeStyles[type];
}

// 任务状态主题
const taskStatusStyles: Record<TaskStatus, IconStyle> = {
  pending: { icon: Clock, color: 'text-moss-white/60' },
  running: { icon: Activity, color: 'text-cyber-green', iconClassName: 'animate-pulse' },
  completed: { icon: CheckCircle, color: 'text-moss-cyan' },
  failed: { icon: XCircle, color: 'text-cyber-red' },
  cancelled: { icon: AlertTriangle, color: 'text-moss-white/40' },
};

export function getTaskStatusStyle(status: TaskStatus): IconStyle {
  return taskStatusStyles[status];
}

// 任务优先级颜色
const taskPriorityColors: Record<TaskPriority, string> = {
  low: 'text-moss-white/60',
  normal: 'text-moss-white/80',
  high: 'text-cyber-orange',
  critical: 'text-cyber-red',
};

export function getTaskPriorityColor(priority: TaskPriority): string {
  return taskPriorityColors[priority];
}

// 决策紧急度颜色
const urgencyColors: Record<DecisionUrgency, string> = {
  low: 'text-moss-white/60',
  medium: 'text-cyber-orange',
  high: 'text-cyber-red',
  critical: 'text-cyber-red animate-pulse',
};

export function getUrgencyColor(urgency: DecisionUrgency): string {
  return urgencyColors[urgency];
}
