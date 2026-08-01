import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMossMessage,
  getMossAnalysisMessage,
  getMossInfoMessage,
  getMossQuestionMessage,
  MOSSDecisionEngine,
} from '@/lib/ai/decisionEngine';
import type { DecisionInput } from '@/types';

// mock decisionDB，避免 analyze 写入真实 IndexedDB
vi.mock('@/lib/db', () => ({
  decisionDB: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

// 固定 uuid，便于断言生成的决策 id
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid'),
}));

const baseInput: DecisionInput = { context: 'test', data: {} };

describe('getMossMessage 系列', () => {
  it('returns a non-empty string for each known message type', () => {
    const types = [
      'greeting',
      'decision',
      'warning',
      'success',
      'info',
      'question',
      'analysis',
    ] as const;
    for (const type of types) {
      const msg = getMossMessage(type);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it('getMossAnalysisMessage returns an analysis message', () => {
    const analysisPool = [
      '根据历史数据分析，系统负载呈现周期性波动。',
      '预测未来24小时内，系统使用率将维持在正常范围内。',
      '分析显示，优化后系统响应时间可减少30%。',
      '风险评估完成，当前系统安全等级为A级。',
    ];
    expect(analysisPool).toContain(getMossAnalysisMessage());
  });

  it('getMossInfoMessage returns an info message', () => {
    expect(getMossInfoMessage()).toContain('系统');
  });

  it('getMossQuestionMessage returns a question message', () => {
    const msg = getMossQuestionMessage();
    expect(msg).toContain('？');
  });
});

describe('MOSSDecisionEngine.analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no rule matches (normal load)', async () => {
    // cpu 50 / memory 50 / 无风险 / 无 critical 任务 / uptime 低 / 网络正常 -> 无规则命中
    const decision = await MOSSDecisionEngine.analyze({
      context: 'normal',
      data: { cpu: 50, memory: 50 },
    });
    expect(decision).toBeNull();
  });

  it('triggers resource_optimization when cpu > 80', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'high cpu',
      data: { cpu: 95, memory: 40 },
    });
    expect(decision).not.toBeNull();
    expect(decision!.type).toBe('resource_optimization');
    expect(decision!.recommendation.urgency).toBe('high');
    expect(decision!.recommendation.parameters).toMatchObject({ target: 'cpu' });
  });

  it('triggers resource_optimization targeting memory when memory > 80', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'high memory',
      data: { cpu: 40, memory: 90 },
    });
    expect(decision!.type).toBe('resource_optimization');
    expect(decision!.recommendation.parameters).toMatchObject({ target: 'memory' });
  });

  it('triggers risk_assessment when riskScore > 70', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'risk',
      data: { riskScore: 85, riskType: 'security' },
    });
    expect(decision!.type).toBe('risk_assessment');
    expect(decision!.recommendation.urgency).toBe('critical');
  });

  it('triggers task_priority when a critical pending task exists', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'tasks',
      data: { tasks: [{ id: 't1', priority: 'critical', status: 'pending' }] },
    });
    expect(decision!.type).toBe('task_priority');
    expect(decision!.recommendation.parameters).toMatchObject({ taskIds: ['t1'] });
  });

  it('triggers system_maintenance when uptime > 24h', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'long uptime',
      data: { uptime: 100000 },
    });
    expect(decision!.type).toBe('system_maintenance');
    expect(decision!.recommendation.urgency).toBe('low');
  });

  it('triggers energy_optimization when cpu < 30', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'low load',
      data: { cpu: 15 },
    });
    expect(decision!.type).toBe('energy_optimization');
    expect(decision!.recommendation.parameters).toMatchObject({ mode: 'eco' });
  });

  it('triggers anomaly_detection on abnormal network traffic', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'network',
      data: { network: { upload: 2000, download: 3000 } },
    });
    expect(decision!.type).toBe('anomaly_detection');
  });

  it('auto-executes low urgency decisions (status executed)', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'low load',
      data: { cpu: 15 },
    });
    expect(decision!.autoExecuted).toBe(true);
    expect(decision!.status).toBe('executed');
    expect(decision!.humanApproval).toBe(true);
  });

  it('requires approval for high urgency decisions (status pending)', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'high cpu',
      data: { cpu: 95 },
    });
    expect(decision!.autoExecuted).toBe(false);
    expect(decision!.status).toBe('pending');
    expect(decision!.humanApproval).toBeNull();
  });

  it('generates reasoning containing analysis and action', async () => {
    const decision = await MOSSDecisionEngine.analyze({
      context: 'high cpu',
      data: { cpu: 95 },
    });
    expect(decision!.reasoning.length).toBeGreaterThan(0);
    // 推理应包含建议操作（resource_optimization 的 action 为 optimize_resources）
    const joined = decision!.reasoning.join('\n');
    expect(joined).toContain('optimize_resources');
    expect(joined).toContain('建议操作');
  });

  it('confidence is capped at 1.0', async () => {
    // resource_optimization: data 非空(+0.2), impact 高(+0.2), 有备选(+0.1) = 1.0
    const decision = await MOSSDecisionEngine.analyze({
      context: 'high cpu',
      data: { cpu: 95 },
    });
    expect(decision!.confidence).toBeLessThanOrEqual(1.0);
    expect(decision!.confidence).toBeGreaterThan(0.5);
  });

  it('persists the decision via createDecision', async () => {
    const { decisionDB } = await import('@/lib/db');
    await MOSSDecisionEngine.analyze({ context: 'high cpu', data: { cpu: 95 } });
    expect(decisionDB.add).toHaveBeenCalledOnce();
  });
});
