/**
 * @WIP 占位实现
 * 当前使用模块级空数组（decisions: AIDecision[] = []），GET 永远 404。
 * 待后续接入服务端持久层。
 */
import { NextRequest, NextResponse } from 'next/server';
import { AIDecision } from '@/types';

const decisions: AIDecision[] = [];

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const decision = decisions.find((d) => d.id === params.id);

  if (!decision) {
    return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
  }

  return NextResponse.json(decision);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = decisions.findIndex((d) => d.id === params.id);

  if (index === -1) {
    return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
  }

  const body = await request.json();
  const action = body.action as string;

  if (action === 'approve') {
    decisions[index] = {
      ...decisions[index],
      status: 'approved',
      humanApproval: true,
      approvedBy: body.approvedBy || 'unknown',
      approvedAt: new Date(),
    };

    return NextResponse.json(decisions[index]);
  }

  if (action === 'reject') {
    decisions[index] = {
      ...decisions[index],
      status: 'rejected',
      humanApproval: false,
    };

    return NextResponse.json(decisions[index]);
  }

  return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
}