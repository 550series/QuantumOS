/**
 * @WIP 占位实现
 * 当前使用模块级内存数组（mockTasks），数据不持久化，前端未接入。
 * 客户端走 src/services/ + IndexedDB。待后续接入服务端持久层。
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { Task } from '@/types';

const mockTasks: Task[] = [
  {
    id: 'task-1',
    name: '系统初始化',
    description: '执行系统初始化流程，加载所有核心模块',
    status: 'completed',
    priority: 'critical',
    progress: 100,
    dependencies: [],
    scheduledAt: new Date('2024-06-01T08:00:00Z'),
    startedAt: new Date('2024-06-01T08:00:00Z'),
    completedAt: new Date('2024-06-01T08:05:00Z'),
    result: { success: true, output: '系统初始化完成' },
    error: null,
    resources: { cpu: 45, memory: 256, network: 10 },
    metadata: { module: 'core' },
    createdAt: new Date('2024-06-01T07:55:00Z'),
    updatedAt: new Date('2024-06-01T08:05:00Z'),
  },
  {
    id: 'task-2',
    name: '数据备份',
    description: '执行每日数据备份任务',
    status: 'running',
    priority: 'high',
    progress: 65,
    dependencies: ['task-1'],
    scheduledAt: new Date('2024-06-02T00:00:00Z'),
    startedAt: new Date('2024-06-02T00:00:00Z'),
    completedAt: null,
    result: null,
    error: null,
    resources: { cpu: 30, memory: 512, network: 50, disk: 20 },
    metadata: { type: 'backup', retention: '7d' },
    createdAt: new Date('2024-06-01T23:55:00Z'),
    updatedAt: new Date('2024-06-02T00:15:00Z'),
  },
  {
    id: 'task-3',
    name: '安全扫描',
    description: '运行安全漏洞扫描',
    status: 'pending',
    priority: 'high',
    progress: 0,
    dependencies: [],
    scheduledAt: new Date('2024-06-02T06:00:00Z'),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
    resources: { cpu: 0, memory: 0, network: 0 },
    metadata: { type: 'security' },
    createdAt: new Date('2024-06-01T18:00:00Z'),
    updatedAt: new Date('2024-06-01T18:00:00Z'),
  },
  {
    id: 'task-4',
    name: '日志归档',
    description: '将旧日志压缩并移至归档存储',
    status: 'failed',
    priority: 'normal',
    progress: 42,
    dependencies: ['task-2'],
    scheduledAt: new Date('2024-06-02T02:00:00Z'),
    startedAt: new Date('2024-06-02T02:00:00Z'),
    completedAt: new Date('2024-06-02T02:10:00Z'),
    result: { success: false },
    error: '磁盘空间不足，无法完成归档',
    resources: { cpu: 15, memory: 128, network: 5, disk: 50 },
    metadata: { retention: '30d' },
    createdAt: new Date('2024-06-01T20:00:00Z'),
    updatedAt: new Date('2024-06-02T02:10:00Z'),
  },
  {
    id: 'task-5',
    name: '性能监控报告',
    description: '生成每周性能监控报告',
    status: 'pending',
    priority: 'low',
    progress: 0,
    dependencies: [],
    scheduledAt: new Date('2024-06-03T09:00:00Z'),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
    resources: { cpu: 0, memory: 0, network: 0 },
    metadata: { type: 'report', period: 'weekly' },
    createdAt: new Date('2024-06-01T12:00:00Z'),
    updatedAt: new Date('2024-06-01T12:00:00Z'),
  },
  {
    id: 'task-6',
    name: '依赖更新检查',
    description: '检查所有外部依赖是否有安全更新',
    status: 'cancelled',
    priority: 'normal',
    progress: 15,
    dependencies: [],
    scheduledAt: new Date('2024-06-01T14:00:00Z'),
    startedAt: new Date('2024-06-01T14:00:00Z'),
    completedAt: new Date('2024-06-01T14:02:00Z'),
    result: null,
    error: null,
    resources: { cpu: 10, memory: 64, network: 30 },
    metadata: { type: 'maintenance' },
    createdAt: new Date('2024-06-01T13:00:00Z'),
    updatedAt: new Date('2024-06-01T14:02:00Z'),
  },
];

export async function GET() {
  return NextResponse.json(mockTasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date();

  const newTask: Task = {
    id: uuidv4(),
    name: body.name || '未命名任务',
    description: body.description,
    status: 'pending',
    priority: body.priority || 'normal',
    progress: 0,
    dependencies: body.dependencies || [],
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
    resources: { cpu: 0, memory: 0, network: 0 },
    metadata: body.metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  return NextResponse.json(newTask, { status: 201 });
}