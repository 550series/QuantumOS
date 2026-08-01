import { describe, it, expect } from 'vitest';
import { filterAndSortTasks } from '@/services/taskService';
import type { Task } from '@/types';

const base = {
  description: '',
  progress: 0,
  dependencies: [],
  scheduledAt: null,
  startedAt: null,
  completedAt: null,
  result: null,
  error: null,
  resources: { cpu: 0, memory: 0, network: 0 },
  metadata: {},
  updatedAt: new Date(),
};

const makeTask = (overrides: Partial<Task> & { id: string; name: string }): Task => ({
  ...base,
  status: 'pending',
  priority: 'normal',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

describe('filterAndSortTasks', () => {
  const tasks: Task[] = [
    makeTask({ id: '1', name: 'Alpha', status: 'running', priority: 'high' }),
    makeTask({ id: '2', name: 'Beta', status: 'pending', priority: 'critical' }),
    makeTask({ id: '3', name: 'Gamma', status: 'completed', priority: 'low' }),
  ];

  describe('filtering', () => {
    it('filters by status', () => {
      const result = filterAndSortTasks(tasks, { status: 'running' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by priority', () => {
      const result = filterAndSortTasks(tasks, { priority: 'critical' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('filters by search term against name (case-insensitive)', () => {
      const result = filterAndSortTasks(tasks, { search: 'ALPH' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by search term against description', () => {
      const withDesc = [
        makeTask({ id: 'a', name: 'A', description: '数据库备份' }),
        makeTask({ id: 'b', name: 'B', description: '网络扫描' }),
      ];
      const result = filterAndSortTasks(withDesc, { search: '备份' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
    });

    it('combines multiple filters with AND semantics', () => {
      const result = filterAndSortTasks(tasks, { status: 'pending', priority: 'critical' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('returns empty when no match', () => {
      expect(filterAndSortTasks(tasks, { search: 'zzz' })).toHaveLength(0);
    });

    it('returns all tasks when no filter provided', () => {
      expect(filterAndSortTasks(tasks)).toHaveLength(3);
    });
  });

  describe('sorting', () => {
    it('sorts by name ascending', () => {
      const result = filterAndSortTasks(tasks, undefined, { field: 'name', order: 'asc' });
      expect(result.map((t) => t.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('sorts by name descending', () => {
      const result = filterAndSortTasks(tasks, undefined, { field: 'name', order: 'desc' });
      expect(result.map((t) => t.name)).toEqual(['Gamma', 'Beta', 'Alpha']);
    });

    it('sorts by priority ascending (low -> critical)', () => {
      const result = filterAndSortTasks(tasks, undefined, { field: 'priority', order: 'asc' });
      expect(result.map((t) => t.priority)).toEqual(['low', 'high', 'critical']);
    });

    it('sorts by priority descending (critical -> low)', () => {
      const result = filterAndSortTasks(tasks, undefined, { field: 'priority', order: 'desc' });
      expect(result.map((t) => t.priority)).toEqual(['critical', 'high', 'low']);
    });

    it('sorts by createdAt ascending', () => {
      const ordered = [
        makeTask({ id: 'old', name: 'Old', createdAt: new Date('2026-01-01') }),
        makeTask({ id: 'new', name: 'New', createdAt: new Date('2026-06-01') }),
      ];
      const result = filterAndSortTasks(ordered, undefined, { field: 'createdAt', order: 'asc' });
      expect(result.map((t) => t.id)).toEqual(['old', 'new']);
    });

    it('sorts by scheduledAt with null treated as 0', () => {
      const withSched = [
        makeTask({ id: 'none', name: 'None', scheduledAt: null }),
        makeTask({ id: 'later', name: 'Later', scheduledAt: new Date('2026-12-01') }),
      ];
      const result = filterAndSortTasks(withSched, undefined, {
        field: 'scheduledAt',
        order: 'asc',
      });
      expect(result.map((t) => t.id)).toEqual(['none', 'later']);
    });
  });

  describe('immutability', () => {
    it('does not mutate the input array', () => {
      const input = [tasks[0], tasks[1]];
      const snapshot = input.map((t) => t.id);
      filterAndSortTasks(input, undefined, { field: 'name', order: 'asc' });
      expect(input.map((t) => t.id)).toEqual(snapshot);
    });
  });
});
