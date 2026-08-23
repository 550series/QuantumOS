/**
 * issue #39 修复：GET 与 approve/reject 操作共享 decisionStore，与 POST 创建保持一致。
 */
import { NextRequest, NextResponse } from 'next/server';

import { decisionStore } from '@/app/api/_lib/data/decisions';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const decision = decisionStore.get(params.id);

  if (!decision) {
    return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
  }

  return NextResponse.json(decision);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = decisionStore.get(params.id);

  if (!existing) {
    return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
  }

  const body = await request.json();
  const action = body.action as string;

  if (action === 'approve') {
    const updated = decisionStore.update(params.id, {
      status: 'approved',
      humanApproval: true,
      approvedBy: body.approvedBy || 'unknown',
      approvedAt: new Date(),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  }

  if (action === 'reject') {
    const updated = decisionStore.update(params.id, {
      status: 'rejected',
      humanApproval: false,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
}