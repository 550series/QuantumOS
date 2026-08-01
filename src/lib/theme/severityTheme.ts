/**
 * 统一严重度 / 状态主题映射
 *
 * 解决 issue #27 中提到的 6 处同构 `Record<枚举, { icon, color, bg, border }>` 重复：
 * - LogViewer.levelConfig
 * - AlertSystem.severityConfig
 * - EventMonitor.severityColors / severityLabels
 * - NotificationCenter.typeConfig
 * - AIDecisionCenter.urgencyColors
 * - TaskScheduler.statusColors / statusIcons / priorityColors
 *
 * 设计要点：
 * - icon 统一保存为 `LucideIcon` 组件引用（而非已渲染的 JSX），由调用方按需渲染并控制尺寸/动画。
 * - color / bg / border 为 Tailwind class 字符串，便于直接拼接。
 * - labels 为中文文案，集中维护避免漂移。
 */
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

export interface SeverityStyle {
  /** lucide 图标组件引用，调用方自行渲染以控制尺寸 */
  icon: LucideIcon;
  /** 文本颜色 class，例如 `text-moss-cyan`（critical 含 animate-pulse） */
  color: string;
  /** 背景色 class，例如 `bg-moss-cyan/10` */
  bg: string;
  /** 边框色 class，例如 `border-moss-cyan/30` */
  border: string;
}

/* -------------------------------------------------------------------------- */
/* 通用严重度：info / warning / error / critical                                */
/* 适用：LogLevel、AlertSeverity、EventMonitor.severity                          */
/* -------------------------------------------------------------------------- */

const severityStyles: Record<'info' | 'warning' | 'error' | 'critical', SeverityStyle> = {
  info: {
    icon: Info,
    color: 'text-moss-cyan',
    bg: 'bg-moss-cyan/10',
    border: 'border-moss-cyan/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-cyber-orange',
    bg: 'bg-cyber-orange/10',
    border: 'border-cyber-orange/30',
  },
  error: {
    icon: AlertCircle,
    color: 'text-cyber-red',
    bg: 'bg-cyber-red/10',
    border: 'border-cyber-red/30',
  },
  critical: {
    icon: Zap,
    color: 'text-cyber-red animate-pulse',
    bg: 'bg-cyber-red/20',
    border: 'border-cyber-red/50',
  },
};

export const severityLabels: Record<'info' | 'warning' | 'error' | 'critical', string> = {
  info: '信息',
  warning: '警告',
  error: '错误',
  critical: '严重',
};

/**
 * 获取通用严重度的样式映射。
 * 覆盖原 LogViewer.levelConfig / AlertSystem.severityConfig / EventMonitor.severityColors。
 */
export function getSeverityStyle(
  level: 'info' | 'warning' | 'error' | 'critical'
): SeverityStyle {
  return severityStyles[level];
}

/* -------------------------------------------------------------------------- */
/* 通知类型：info / success / warning / error                                   */
/* 适用：NotificationCenter.typeConfig、AIDecisionCenter 消息着色                  */
/* -------------------------------------------------------------------------- */

const notificationStyles: Record<
  'info' | 'success' | 'warning' | 'error',
  SeverityStyle
> = {
  info: severityStyles.info,
  success: {
    icon: CheckCircle,
    color: 'text-cyber-green',
    bg: 'bg-cyber-green/10',
    border: 'border-cyber-green/30',
  },
  warning: severityStyles.warning,
  error: severityStyles.error,
};

export function getNotificationStyle(
  type: 'info' | 'success' | 'warning' | 'error'
): SeverityStyle {
  return notificationStyles[type];
}

/* -------------------------------------------------------------------------- */
/* 决策紧急度：low / medium / high / critical                                   */
/* 适用：AIDecisionCenter.urgencyColors                                          */
/* -------------------------------------------------------------------------- */

const urgencyStyles: Record<'low' | 'medium' | 'high' | 'critical', SeverityStyle> = {
  low: {
    icon: Info,
    color: 'text-moss-white/60',
    bg: 'bg-moss-white/5',
    border: 'border-moss-white/20',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-cyber-orange',
    bg: 'bg-cyber-orange/10',
    border: 'border-cyber-orange/30',
  },
  high: {
    icon: AlertCircle,
    color: 'text-cyber-red',
    bg: 'bg-cyber-red/10',
    border: 'border-cyber-red/30',
  },
  critical: {
    icon: Zap,
    color: 'text-cyber-red animate-pulse',
    bg: 'bg-cyber-red/20',
    border: 'border-cyber-red/50',
  },
};

export function getUrgencyStyle(
  urgency: 'low' | 'medium' | 'high' | 'critical'
): SeverityStyle {
  return urgencyStyles[urgency];
}

/* -------------------------------------------------------------------------- */
/* 任务状态：pending / running / completed / failed / cancelled                  */
/* 适用：TaskScheduler.statusColors / statusIcons                                 */
/* -------------------------------------------------------------------------- */

const taskStatusStyles: Record<
  'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
  SeverityStyle
> = {
  pending: {
    icon: Clock,
    color: 'text-moss-white/60',
    bg: 'bg-moss-white/5',
    border: 'border-moss-white/20',
  },
  running: {
    icon: Activity,
    color: 'text-cyber-green',
    bg: 'bg-cyber-green/10',
    border: 'border-cyber-green/30',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-moss-cyan',
    bg: 'bg-moss-cyan/10',
    border: 'border-moss-cyan/30',
  },
  failed: {
    icon: XCircle,
    color: 'text-cyber-red',
    bg: 'bg-cyber-red/10',
    border: 'border-cyber-red/30',
  },
  cancelled: {
    icon: AlertTriangle,
    color: 'text-moss-white/40',
    bg: 'bg-moss-white/5',
    border: 'border-moss-white/10',
  },
};

export function getTaskStatusStyle(
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
): SeverityStyle {
  return taskStatusStyles[status];
}

/* running 状态图标需要 animate-pulse 动画，单独暴露以便调用方附加 */
export const taskStatusIconClassName: Record<
  'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
  string
> = {
  pending: '',
  running: 'animate-pulse',
  completed: '',
  failed: '',
  cancelled: '',
};

/* -------------------------------------------------------------------------- */
/* 任务优先级：low / normal / high / critical                                    */
/* 适用：TaskScheduler.priorityColors                                             */
/* -------------------------------------------------------------------------- */

export const taskPriorityColors: Record<
  'low' | 'normal' | 'high' | 'critical',
  string
> = {
  low: 'text-moss-white/60',
  normal: 'text-moss-white/80',
  high: 'text-cyber-orange',
  critical: 'text-cyber-red',
};
