/**
 * issue #39 修复：POST 创建的任务持久化到共享 store，
 * GET / GET [id] / PUT / DELETE 均读取同一实例，数据保持一致。
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { taskStore } from '@/app/api/_lib/data/tasks';
import { parseJsonSafe, withErrorHandling, badRequest } from '@/app/api/_lib/http';
import { Task } from '@/types';

export async function GET() {
  return withErrorHandling(async () => NextResponse.json(taskStore.list()));
}

export async function POST(request: NextRequest) {
  const parsed = await parseJsonSafe<Partial<Task>>(request);
  if (!parsed.ok) return parsed.response;

  const body = parsed.body;
  const now = new Date();

  if (!body.name || typeof body.name !== 'string') {
    return badRequest('name is required');
  }

  const newTask: Task = {
    id: uuidv4(),
    name: body.name,
    description: body.description,
    status: 'pending',
    priority: body.priority || 'normal',
    progress: 0,
    dependencies: Array.isArray(body.dependencies) ? body.dependencies : [],
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

  taskStore.create(newTask);

  return NextResponse.json(newTask, { status: 201 });
}