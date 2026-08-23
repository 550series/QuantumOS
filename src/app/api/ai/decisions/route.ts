/**
 * issue #39 修复：POST 创建的决策持久化到共享 store，GET 读取同一实例。
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { decisionStore } from '@/app/api/_lib/data/decisions';
import { AIDecision } from '@/types';

export async function GET() {
  return NextResponse.json(decisionStore.list());
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newDecision: AIDecision = {
    id: uuidv4(),
    type: body.type || 'anomaly_detection',
    timestamp: new Date(),
    confidence: body.confidence || 0.5,
    input: body.input || { context: '', data: {} },
    reasoning: body.reasoning || [],
    recommendation: body.recommendation || {
      action: '',
      parameters: {},
      impact: {
        performance: 0,
        security: 0,
        stability: 0,
        userExperience: 0,
        description: '',
      },
      alternatives: [],
      urgency: 'medium',
    },
    autoExecuted: false,
    humanApproval: null,
    status: 'pending',
  };

  decisionStore.create(newDecision);

  return NextResponse.json(newDecision, { status: 201 });
}