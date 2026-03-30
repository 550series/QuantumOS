import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Task, TaskFilter, TaskSort, TaskStats } from '@/types';

interface TaskState {
  // 任务数据
  tasks: Task[];
  selectedTaskId: string | null;

  // 统计信息
  stats: TaskStats;

  // 过滤和排序
  filter: TaskFilter;
  sort: TaskSort;

  // 操作状态
  loading: boolean;
  error: string | null;

  // 操作方法
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // 选择操作
  selectTask: (id: string | null) => void;

  // 过滤和排序
  setFilter: (filter: TaskFilter) => void;
  setSort: (sort: TaskSort) => void;

  // 统计更新
  updateStats: () => void;

  // 状态操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>()(
  immer((set, get) => ({
    // 初始状态
    tasks: [],
    selectedTaskId: null,
    stats: {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    },
    filter: {},
    sort: { field: 'createdAt', order: 'desc' },
    loading: false,
    error: null,

    // 任务操作
    setTasks: (tasks) =>
      set((state) => {
        state.tasks = tasks;
        updateStatsInternal(state);
      }),

    addTask: (task) =>
      set((state) => {
        state.tasks.push(task);
        updateStatsInternal(state);
      }),

    updateTask: (id, updates) =>
      set((state) => {
        const index = state.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...updates };
          updateStatsInternal(state);
        }
      }),

    deleteTask: (id) =>
      set((state) => {
        state.tasks = state.tasks.filter((t) => t.id !== id);
        if (state.selectedTaskId === id) {
          state.selectedTaskId = null;
        }
        updateStatsInternal(state);
      }),

    // 选择操作
    selectTask: (id) =>
      set((state) => {
        state.selectedTaskId = id;
      }),

    // 过滤和排序
    setFilter: (filter) =>
      set((state) => {
        state.filter = { ...state.filter, ...filter };
      }),

    setSort: (sort) =>
      set((state) => {
        state.sort = sort;
      }),

    // 统计更新
    updateStats: () =>
      set((state) => {
        updateStatsInternal(state);
      }),

    // 状态操作
    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
  }))
);

// 内部统计更新函数
function updateStatsInternal(state: any) {
  const tasks = state.tasks as Task[];
  state.stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    running: tasks.filter((t) => t.status === 'running').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
    cancelled: tasks.filter((t) => t.status === 'cancelled').length,
  };
}
