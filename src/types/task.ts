// 任务调度类型定义

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0-100
  dependencies: string[]; // Task IDs
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  result: TaskResult | null;
  error: string | null;
  resources: ResourceUsage;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResult {
  success: boolean;
  output?: string;
  data?: Record<string, unknown>;
}

export interface ResourceUsage {
  cpu: number; // percentage
  memory: number; // MB
  network: number; // KB/s
  disk?: number; // MB/s
}

export interface TaskStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export interface TaskSort {
  field: 'name' | 'priority' | 'status' | 'createdAt' | 'scheduledAt';
  order: 'asc' | 'desc';
}
