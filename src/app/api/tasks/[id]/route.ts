/**
 * issue #39 修复：GET / PUT / DELETE 改为操作共享 taskStore，
 * 与 POST 创建、集合 GET 保持一致。
 */
import { NextRequest, NextResponse } from 'next/server';

import { taskStore } from '@/app/api/_lib/data/tasks';
import { parseJsonSafe, withErrorHandling, notFound } from '@/app/api/_lib/http';
import { Task } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const task = taskStore.get(params.id);
    if (!task) return notFound('Task not found');
    return NextResponse.json(task);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const existing = taskStore.get(params.id);
    if (!existing) return notFound('Task not found');

    const parsed = await parseJsonSafe<Partial<Task> & Record<string, any>>(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.body;

    const patch: Partial<Task> = {
      ...body,
      updatedAt: new Date(),
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : existing.scheduledAt,
      startedAt: body.startedAt ? new Date(body.startedAt) : existing.startedAt,
      completedAt: body.completedAt ? new Date(body.completedAt) : existing.completedAt,
    };

    if (body.status === 'completed' && !patch.completedAt) {
      patch.completedAt = new Date();
      patch.progress = 100;
    }

    if (body.status === 'running' && !patch.startedAt) {
      patch.startedAt = new Date();
    }

    const updated = taskStore.update(params.id, patch);
    if (!updated) return notFound('Task not found');

    return NextResponse.json(updated);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const deleted = taskStore.remove(params.id);
    if (!deleted) return notFound('Task not found');
    return NextResponse.json({ deleted: params.id });
  });
}