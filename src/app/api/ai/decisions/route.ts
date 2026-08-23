/**
 * issue #39 修复：POST 创建的决策持久化到共享 store，GET 读取同一实例。
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { decisionStore } from '@/app/api/_lib/data/decisions';
import { parseJsonSafe, withErrorHandling, badRequest } from '@/app/api/_lib/http';
import { AIDecision } from '@/types';

export async function GET() {
  return withErrorHandling(async () => NextResponse.json(decisionStore.list()));
}

export async function POST(request: NextRequest) {
  const parsed = await parseJsonSafe<Partial<AIDecision>>(request);
  if (!parsed.ok) return parsed.response;

  const body = parsed.body;
  const confidence = Number(body.confidence);
  if (Number.isNaN(confidence) || confidence < 0 || confidence > 1) {
    return badRequest('confidence must be a number between 0 and 1');
  }

  const newDecision: AIDecision = {
    id: uuidv4(),
    type: body.type || 'anomaly_detection',
    timestamp: new Date(),
    confidence: confidence || 0.5,
    input: body.input || { context: '', data: {} },
    reasoning: Array.isArray(body.reasoning) ? body.reasoning : [],
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