import { describe, it, expect } from 'vitest';

import type { Task } from '@/types';

import { filterAndSortTasks } from './taskService';

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  const now = new Date('2026-01-01T00:00:00Z');
  return {
    name: 'task',
    description: '',
    status: 'pending',
    priority: 'normal',
    progress: 0,
    dependencies: [],
    scheduledAt: null,
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
    resources: { cpu: 0, memory: 0, network: 0 },
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('filterAndSortTasks', () => {
  const tasks: Task[] = [
    makeTask({ id: '1', name: 'Alpha', status: 'pending', priority: 'low' }),
    makeTask({ id: '2', name: 'Beta', status: 'running', priority: 'high' }),
    makeTask({ id: '3', name: 'Gamma', status: 'completed', priority: 'critical' }),
    makeTask({ id: '4', name: 'Delta', status: 'failed', priority: 'normal' }),
  ];

  describe('过滤', () => {
    it('无 filter 返回全部任务', () => {
      expect(filterAndSortTasks(tasks)).toHaveLength(4);
    });

    it('按 status 过滤', () => {
      const result = filterAndSortTasks(tasks, { status: 'running' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('按 priority 过滤', () => {
      const result = filterAndSortTasks(tasks, { priority: 'critical' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('按 search 匹配 name（大小写不敏感）', () => {
      const result = filterAndSortTasks(tasks, { search: 'GAMMA' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('按 search 匹配 description', () => {
      const withDesc = makeTask({
        id: '5',
        name: 'Other',
        description: 'Important backup job',
      });
      const result = filterAndSortTasks([withDesc], { search: 'backup' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('5');
    });

    it('search 为空字符串时不过滤', () => {
      const result = filterAndSortTasks(tasks, { search: '' });
      expect(result).toHaveLength(4);
    });

    it('组合 status + priority 过滤', () => {
      const result = filterAndSortTasks(tasks, { status: 'completed', priority: 'critical' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('排序', () => {
    it('按 name 升序', () => {
      const result = filterAndSortTasks(tasks, undefined, { field: 'name', order: 'asc' });
      expect(result.map((t) => t.name)).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
    });

    it('按 name 降序', () => {
      const result = filterAndSortTasks(tasks, undefined, { field: 'name', order: 'desc' });
      expect(result.map((t) => t.name)).toEqual(['Gamma', 'Delta', 'Beta', 'Alpha']);
    });

    it('按 priority 降序（critical > low）', () => {
      const result = filterAndSortTasks(tasks, undefined, { field: 'priority', order: 'desc' });
      expect(result[0].priority).toBe('critical');
      expect(result[result.length - 1].priority).toBe('low');
    });

    it('按 status 升序（字母序）', () => {
      const result = filterAndSortTasks(tasks, undefined, { field: 'status', order: 'asc' });
      expect(result.map((t) => t.status)).toEqual([
        'completed',
        'failed',
        'pending',
        'running',
      ]);
    });

    it('按 createdAt 升序', () => {
      const t1 = makeTask({ id: 'a', createdAt: new Date('2026-01-01') });
      const t2 = makeTask({ id: 'b', createdAt: new Date('2026-01-02') });
      const result = filterAndSortTasks([t2, t1], undefined, { field: 'createdAt', order: 'asc' });
      expect(result.map((t) => t.id)).toEqual(['a', 'b']);
    });

    it('按 scheduledAt 排序，null 视为 0（升序时在前）', () => {
      const t1 = makeTask({ id: 'a', scheduledAt: null });
      const t2 = makeTask({ id: 'b', scheduledAt: new Date('2026-01-05') });
      const result = filterAndSortTasks([t2, t1], undefined, { field: 'scheduledAt', order: 'asc' });
      expect(result.map((t) => t.id)).toEqual(['a', 'b']);
    });

    it('无 sort 返回原序（不排序）', () => {
      const result = filterAndSortTasks(tasks);
      expect(result.map((t) => t.id)).toEqual(['1', '2', '3', '4']);
    });
  });

  describe('不可变性', () => {
    it('不修改原数组', () => {
      const original = [...tasks];
      filterAndSortTasks(tasks, { status: 'running' }, { field: 'name', order: 'asc' });
      expect(tasks).toEqual(original);
    });

    it('返回新数组实例', () => {
      const result = filterAndSortTasks(tasks);
      expect(result).not.toBe(tasks);
    });
  });
});
