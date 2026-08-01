/**
 * @WIP 占位实现
 * 当前使用模块级空数组（tasks: Task[] = []），GET 永远 404。
 * 待后续接入服务端持久层。
 */
import { NextRequest, NextResponse } from 'next/server';

import { Task, TaskStatus } from '@/types';

const tasks: Task[] = [];

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = tasks.find((t) => t.id === params.id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = tasks.findIndex((t) => t.id === params.id);

  if (index === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const body = await request.json();

  const updated: Task = {
    ...tasks[index],
    ...body,
    id: params.id,
    updatedAt: new Date(),
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : tasks[index].scheduledAt,
    startedAt: body.startedAt ? new Date(body.startedAt) : tasks[index].startedAt,
    completedAt: body.completedAt ? new Date(body.completedAt) : tasks[index].completedAt,
    createdAt: tasks[index].createdAt,
  };

  if (body.status === 'completed' && !updated.completedAt) {
    updated.completedAt = new Date();
    updated.progress = 100;
  }

  if (body.status === 'running' && !updated.startedAt) {
    updated.startedAt = new Date();
  }

  tasks[index] = updated;

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = tasks.findIndex((t) => t.id === params.id);

  if (index === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const deleted = tasks.splice(index, 1)[0];

  return NextResponse.json({ deleted: deleted.id });
}