import { describe, it, expect } from 'vitest';

import type { LogEntry } from '@/types';

import { filterLogs } from './logService';

const logs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(),
    level: 'info',
    category: 'system',
    source: 'MOSS',
    message: '系统启动成功',
    details: undefined,
  },
  {
    id: '2',
    timestamp: new Date(),
    level: 'error',
    category: 'ai',
    source: 'Engine',
    message: '推理失败',
    details: { code: 500 },
  },
  {
    id: '3',
    timestamp: new Date(),
    level: 'warning',
    category: 'system',
    source: 'Core',
    message: '负载过高',
    details: undefined,
  },
];

describe('filterLogs', () => {
  it('按级别过滤', () => {
    expect(filterLogs(logs, 'error')).toHaveLength(1);
    expect(filterLogs(logs, 'error')[0].id).toBe('2');
  });

  it('按分类过滤', () => {
    expect(filterLogs(logs, undefined, 'system')).toHaveLength(2);
  });

  it('按关键字搜索 message 或 source', () => {
    expect(filterLogs(logs, undefined, undefined, 'Engine')).toHaveLength(1);
    expect(filterLogs(logs, undefined, undefined, '启动')).toHaveLength(1);
  });

  it('组合条件过滤', () => {
    expect(filterLogs(logs, 'warning', 'system')).toHaveLength(1);
    expect(filterLogs(logs, 'info', 'ai')).toHaveLength(0);
  });

  it('无任何过滤条件时返回全部', () => {
    expect(filterLogs(logs)).toHaveLength(3);
  });
});