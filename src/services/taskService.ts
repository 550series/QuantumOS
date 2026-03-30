import { v4 as uuidv4 } from 'uuid';
import { taskDB } from '@/lib/db';
import type { Task, TaskFilter, TaskSort, TaskStats } from '@/types';

// 初始化示例任务
export async function initDefaultTasks(): Promise<void> {
  const existingTasks = await taskDB.getAll();
  if (existingTasks.length > 0) return;

  const defaultTasks: Partial<Task>[] = [
    {
      name: '系统监控服务',
      description: '实时监控系统资源使用情况',
      status: 'running',
      priority: 'high',
      progress: 0,
    },
    {
      name: '数据备份任务',
      description: '定期备份用户数据到云端',
      status: 'pending',
      priority: 'normal',
      progress: 0,
    },
    {
      name: 'AI模型训练',
      description: '更新MOSS决策模型',
      status: 'completed',
      priority: 'critical',
      progress: 100,
    },
  ];

  const now = new Date();

  for (const taskData of defaultTasks) {
    const task: Task = {
      id: uuidv4(),
      name: taskData.name || '未命名任务',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'normal',
      progress: taskData.progress || 0,
      dependencies: [],
      scheduledAt: null,
      startedAt: taskData.status === 'running' ? now : null,
      completedAt: taskData.status === 'completed' ? now : null,
      result: null,
      error: null,
      resources: {
        cpu: Math.random() * 50,
        memory: Math.random() * 500,
        network: Math.random() * 100,
      },
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };
    await taskDB.add(task);
  }
}

// 获取任务列表
export async function getTasks(): Promise<Task[]> {
  return await taskDB.getAll();
}

// 获取单个任务
export async function getTask(id: string): Promise<Task | undefined> {
  return await taskDB.getById(id);
}

// 创建任务
export async function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> {
  const now = new Date();
  const newTask: Task = {
    ...task,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  await taskDB.add(newTask);
  return newTask;
}

// 更新任务
export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<Task | undefined> {
  const task = await taskDB.getById(id);
  if (!task) return undefined;

  const updatedTask: Task = {
    ...task,
    ...updates,
    updatedAt: new Date(),
  };
  await taskDB.put(updatedTask);
  return updatedTask;
}

// 删除任务
export async function deleteTask(id: string): Promise<void> {
  await taskDB.delete(id);
}

// 启动任务
export async function startTask(id: string): Promise<Task | undefined> {
  return await updateTask(id, {
    status: 'running',
    startedAt: new Date(),
  });
}

// 暂停任务
export async function pauseTask(id: string): Promise<Task | undefined> {
  const task = await getTask(id);
  if (!task) return undefined;

  return await updateTask(id, {
    status: 'pending',
  });
}

// 取消任务
export async function cancelTask(id: string): Promise<Task | undefined> {
  return await updateTask(id, {
    status: 'cancelled',
    completedAt: new Date(),
  });
}

// 完成任务
export async function completeTask(
  id: string,
  result?: any
): Promise<Task | undefined> {
  return await updateTask(id, {
    status: 'completed',
    progress: 100,
    completedAt: new Date(),
    result,
  });
}

// 失败任务
export async function failTask(
  id: string,
  error: string
): Promise<Task | undefined> {
  return await updateTask(id, {
    status: 'failed',
    error,
    completedAt: new Date(),
  });
}

// 获取任务统计
export async function getTaskStats(): Promise<TaskStats> {
  const tasks = await getTasks();
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    running: tasks.filter((t) => t.status === 'running').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
    cancelled: tasks.filter((t) => t.status === 'cancelled').length,
  };
}

// 过滤和排序任务
export function filterAndSortTasks(
  tasks: Task[],
  filter?: TaskFilter,
  sort?: TaskSort
): Task[] {
  let result = [...tasks];

  // 应用过滤
  if (filter) {
    if (filter.status) {
      result = result.filter((t) => t.status === filter.status);
    }
    if (filter.priority) {
      result = result.filter((t) => t.priority === filter.priority);
    }
    if (filter.search) {
      const lowerSearch = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerSearch) ||
          (t.description && t.description.toLowerCase().includes(lowerSearch))
      );
    }
  }

  // 应用排序
  if (sort) {
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'scheduledAt':
          const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
          const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
          comparison = aTime - bTime;
          break;
      }
      return sort.order === 'asc' ? comparison : -comparison;
    });
  }

  return result;
}

// 模拟任务执行
export async function simulateTaskExecution(
  taskId: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const task = await getTask(taskId);
  if (!task) return;

  await startTask(taskId);

  // 模拟进度更新
  for (let progress = 0; progress <= 100; progress += 10) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await updateTask(taskId, { progress });
    if (onProgress) onProgress(progress);
  }

  // 模拟成功或失败
  const success = Math.random() > 0.2; // 80%成功率
  if (success) {
    await completeTask(taskId, { success: true, output: '任务执行成功' });
  } else {
    await failTask(taskId, '模拟任务执行失败');
  }
}
