import { describe, it, expect, beforeEach } from 'vitest';

import type { Task } from '@/types';

import { useTaskStore } from './taskStore';

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

/**
 * updateStatsInternal 是模块私有函数，无法直接测试。
 * 这里通过调用它的公开 action（setTasks/addTask/updateTask/deleteTask/updateStats）
 * 来覆盖 stats 重算逻辑（issue #30）。
 */
describe('useTaskStore - updateStatsInternal（经公开 action 覆盖）', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      selectedTaskId: null,
      stats: { total: 0, pending: 0, running: 0, completed: 0, failed: 0, cancelled: 0 },
      filter: {},
      sort: { field: 'createdAt', order: 'desc' },
      loading: false,
      error: null,
    });
  });

  it('初始 stats 全为 0', () => {
    const { stats } = useTaskStore.getState();
    expect(stats).toEqual({
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    });
  });

  it('setTasks 后 stats 按各状态计数', () => {
    const tasks: Task[] = [
      makeTask({ id: '1', status: 'pending' }),
      makeTask({ id: '2', status: 'running' }),
      makeTask({ id: '3', status: 'completed' }),
      makeTask({ id: '4', status: 'failed' }),
      makeTask({ id: '5', status: 'cancelled' }),
      makeTask({ id: '6', status: 'pending' }),
    ];

    useTaskStore.getState().setTasks(tasks);

    expect(useTaskStore.getState().stats).toEqual({
      total: 6,
      pending: 2,
      running: 1,
      completed: 1,
      failed: 1,
      cancelled: 1,
    });
  });

  it('addTask 后 stats 重新计算', () => {
    useTaskStore.getState().addTask(makeTask({ id: '1', status: 'pending' }));
    useTaskStore.getState().addTask(makeTask({ id: '2', status: 'running' }));

    expect(useTaskStore.getState().stats).toEqual({
      total: 2,
      pending: 1,
      running: 1,
      completed: 0,
      failed: 0,
      cancelled: 0,
    });
  });

  it('updateTask 改变状态后 stats 重新计算', () => {
    useTaskStore.getState().setTasks([
      makeTask({ id: '1', status: 'pending' }),
      makeTask({ id: '2', status: 'pending' }),
    ]);

    useTaskStore.getState().updateTask('1', { status: 'completed' });

    const { stats } = useTaskStore.getState();
    expect(stats.pending).toBe(1);
    expect(stats.completed).toBe(1);
  });

  it('updateTask 不存在的 id 不改变 stats', () => {
    useTaskStore.getState().setTasks([makeTask({ id: '1', status: 'pending' })]);
    const before = useTaskStore.getState().stats;

    useTaskStore.getState().updateTask('missing', { status: 'completed' });

    expect(useTaskStore.getState().stats).toEqual(before);
  });

  it('deleteTask 后 stats 重新计算', () => {
    useTaskStore.getState().setTasks([
      makeTask({ id: '1', status: 'pending' }),
      makeTask({ id: '2', status: 'running' }),
    ]);

    useTaskStore.getState().deleteTask('1');

    expect(useTaskStore.getState().stats).toEqual({
      total: 1,
      pending: 0,
      running: 1,
      completed: 0,
      failed: 0,
      cancelled: 0,
    });
  });

  it('deleteTask 删除选中任务时清空 selectedTaskId', () => {
    useTaskStore.getState().setTasks([makeTask({ id: '1', status: 'pending' })]);
    useTaskStore.getState().selectTask('1');

    useTaskStore.getState().deleteTask('1');

    expect(useTaskStore.getState().selectedTaskId).toBeNull();
  });

  it('updateStats 手动触发时重算', () => {
    // 直接篡改 stats 制造不一致，再用 updateStats 修正
    useTaskStore.setState({
      tasks: [makeTask({ id: '1', status: 'completed' })],
      stats: { total: 99, pending: 99, running: 0, completed: 0, failed: 0, cancelled: 0 },
    });

    useTaskStore.getState().updateStats();

    expect(useTaskStore.getState().stats).toEqual({
      total: 1,
      pending: 0,
      running: 0,
      completed: 1,
      failed: 0,
      cancelled: 0,
    });
  });

  it('空任务列表 stats 全归零', () => {
    useTaskStore.getState().setTasks([
      makeTask({ id: '1', status: 'running' }),
    ]);
    useTaskStore.getState().setTasks([]);

    expect(useTaskStore.getState().stats).toEqual({
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    });
  });
});
