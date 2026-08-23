/**
 * issue #39 修复：GET / PUT / DELETE 改为操作共享 taskStore，
 * 与 POST 创建、集合 GET 保持一致。
 */
import { NextRequest, NextResponse } from 'next/server';

import { taskStore } from '@/app/api/_lib/data/tasks';
import { Task } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = taskStore.get(params.id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = taskStore.get(params.id);

  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const body = await request.json();

  const patch: Partial<Task> = {
    ...body,
    updatedAt: new Date(),
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt as string) : existing.scheduledAt,
    startedAt: body.startedAt ? new Date(body.startedAt as string) : existing.startedAt,
    completedAt: body.completedAt ? new Date(body.completedAt as string) : existing.completedAt,
  };

  if (body.status === 'completed' && !patch.completedAt) {
    patch.completedAt = new Date();
    patch.progress = 100;
  }

  if (body.status === 'running' && !patch.startedAt) {
    patch.startedAt = new Date();
  }

  const updated = taskStore.update(params.id, patch);

  if (!updated) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const deleted = taskStore.remove(params.id);

  if (!deleted) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ deleted: params.id });
}