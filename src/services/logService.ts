import { v4 as uuidv4 } from 'uuid';
import { logDB, alertDB } from '@/lib/db';
import type { LogEntry, Alert, LogLevel, LogCategory, AlertSeverity } from '@/types';

// 初始化示例日志
export async function initDefaultLogs(): Promise<void> {
  const existingLogs = await logDB.getAll();
  if (existingLogs.length > 0) return;

  const now = new Date();
  const defaultLogs: Partial<LogEntry>[] = [
    {
      level: 'info',
      category: 'system',
      source: 'MOSS',
      message: '系统启动成功',
    },
    {
      level: 'info',
      category: 'system',
      source: 'Core',
      message: '量子计算核心初始化完成',
    },
    {
      level: 'info',
      category: 'ai',
      source: 'MOSS',
      message: 'AI决策引擎已就绪',
    },
    {
      level: 'info',
      category: 'system',
      source: 'Database',
      message: 'IndexedDB连接成功',
    },
  ];

  for (const logData of defaultLogs) {
    const log: LogEntry = {
      id: uuidv4(),
      timestamp: now,
      level: logData.level || 'info',
      category: logData.category || 'system',
      source: logData.source || 'System',
      message: logData.message || '',
      details: logData.details,
    };
    await logDB.add(log);
  }
}

// 初始化示例警报
export async function initDefaultAlerts(): Promise<void> {
  const existingAlerts = await alertDB.getAll();
  if (existingAlerts.length > 0) return;

  const now = new Date();
  const defaultAlert: Alert = {
    id: uuidv4(),
    timestamp: now,
    severity: 'info',
    title: '系统初始化',
    message: 'MOSS操作系统已成功启动，所有系统运行正常。',
    source: 'MOSS',
    acknowledged: false,
  };

  await alertDB.add(defaultAlert);
}

// 获取日志列表
export async function getLogs(limit = 100): Promise<LogEntry[]> {
  const logs = await logDB.getAll();
  return logs.slice(0, limit);
}

// 创建日志
export async function createLog(
  level: LogLevel,
  category: LogCategory,
  source: string,
  message: string,
  details?: Record<string, unknown>
): Promise<LogEntry> {
  const log: LogEntry = {
    id: uuidv4(),
    timestamp: new Date(),
    level,
    category,
    source,
    message,
    details,
  };
  await logDB.add(log);
  return log;
}

// 清空日志
export async function clearLogs(): Promise<void> {
  await logDB.clear();
}

// 获取警报列表
export async function getAlerts(limit = 50): Promise<Alert[]> {
  const alerts = await alertDB.getAll();
  return alerts.slice(0, limit);
}

// 获取活动警报
export async function getActiveAlerts(): Promise<Alert[]> {
  const alerts = await alertDB.getAll();
  return alerts.filter((alert) => !alert.acknowledged);
}

// 创建警报
export async function createAlert(
  severity: AlertSeverity,
  title: string,
  message: string,
  source: string
): Promise<Alert> {
  const alert: Alert = {
    id: uuidv4(),
    timestamp: new Date(),
    severity,
    title,
    message,
    source,
    acknowledged: false,
  };
  await alertDB.add(alert);
  return alert;
}

// 确认警报
export async function acknowledgeAlert(id: string, acknowledgedBy: string): Promise<Alert | undefined> {
  const alert = await alertDB.getById(id);
  if (!alert) return undefined;

  const updatedAlert: Alert = {
    ...alert,
    acknowledged: true,
    acknowledgedBy,
    acknowledgedAt: new Date(),
  };
  await alertDB.put(updatedAlert);
  return updatedAlert;
}

// 删除警报
export async function deleteAlert(id: string): Promise<void> {
  await alertDB.delete(id);
}

// 清空已确认的警报
export async function clearAcknowledgedAlerts(): Promise<void> {
  const alerts = await alertDB.getAll();
  const acknowledged = alerts.filter((a) => a.acknowledged);
  for (const alert of acknowledged) {
    await alertDB.delete(alert.id);
  }
}

// 过滤日志
export function filterLogs(
  logs: LogEntry[],
  level?: LogLevel,
  category?: LogCategory,
  search?: string
): LogEntry[] {
  let result = [...logs];

  if (level) {
    result = result.filter((log) => log.level === level);
  }
  if (category) {
    result = result.filter((log) => log.category === category);
  }
  if (search) {
    const lowerSearch = search.toLowerCase();
    result = result.filter(
      (log) =>
        log.message.toLowerCase().includes(lowerSearch) ||
        log.source.toLowerCase().includes(lowerSearch)
    );
  }

  return result;
}

// MOSS日志记录器
export class MOSSLogger {
  static info(category: LogCategory, source: string, message: string, details?: Record<string, unknown>) {
    return createLog('info', category, source, message, details);
  }

  static warning(category: LogCategory, source: string, message: string, details?: Record<string, unknown>) {
    return createLog('warning', category, source, message, details);
  }

  static error(category: LogCategory, source: string, message: string, details?: Record<string, unknown>) {
    return createLog('error', category, source, message, details);
  }

  static critical(category: LogCategory, source: string, message: string, details?: Record<string, unknown>) {
    // 创建关键日志和警报
    createLog('critical', category, source, message, details);
    return createAlert('critical', '系统关键错误', message, source);
  }
}
