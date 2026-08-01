import { describe, it, expect, vi, beforeEach } from 'vitest';

// 必须在 import decisionEngine 之前 mock 依赖，避免触发真实 IndexedDB
vi.mock('@/lib/db', () => ({
  decisionDB: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue('decision-id'),
    put: vi.fn().mockResolvedValue(undefined),
  },
  fileDB: { getAll: vi.fn().mockResolvedValue([]) },
  taskDB: { getAll: vi.fn().mockResolvedValue([]) },
  logDB: { getAll: vi.fn().mockResolvedValue([]) },
  alertDB: { getAll: vi.fn().mockResolvedValue([]) },
  defaultSettings: {
    theme: 'dark',
    animationsEnabled: true,
    soundEnabled: true,
    notificationsEnabled: true,
    language: 'zh-CN',
    autoUpdate: true,
  },
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid'),
}));

import { decisionDB } from '@/lib/db';
import type { DecisionInput, Recommendation } from '@/types';

import { MOSSDecisionEngine } from './decisionEngine';

// 通过括号访问私有静态方法（运行期 JS 可见）
const determineDecisionType = (input: DecisionInput) =>
  (
    MOSSDecisionEngine as unknown as {
      determineDecisionType: (input: DecisionInput) => string | null;
    }
  ).determineDecisionType(input);

const calculateConfidence = (input: DecisionInput, recommendation: Recommendation) =>
  (
    MOSSDecisionEngine as unknown as {
      calculateConfidence: (input: DecisionInput, rec: Recommendation) => number;
    }
  ).calculateConfidence(input, recommendation);

const baseInput: DecisionInput = {
  context: 'test',
  data: {},
};

const baseRecommendation: Recommendation = {
  action: 'test_action',
  parameters: {},
  impact: {
    performance: 0,
    security: 0,
    stability: 0,
    userExperience: 0,
    description: '',
  },
  alternatives: [],
  urgency: 'low',
};

describe('MOSSDecisionEngine - determineDecisionType（规则匹配）', () => {
  it('cpu > 80 命中 resource_optimization', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 85 } };
    expect(determineDecisionType(input)).toBe('resource_optimization');
  });

  it('memory > 80 命中 resource_optimization', () => {
    const input: DecisionInput = { ...baseInput, data: { memory: 90 } };
    expect(determineDecisionType(input)).toBe('resource_optimization');
  });

  it('riskScore > 70 命中 risk_assessment', () => {
    const input: DecisionInput = { ...baseInput, data: { riskScore: 75 } };
    expect(determineDecisionType(input)).toBe('risk_assessment');
  });

  it('存在 critical+pending 任务命中 task_priority', () => {
    const input: DecisionInput = {
      ...baseInput,
      data: { tasks: [{ id: 't1', priority: 'critical', status: 'pending' }] },
    };
    expect(determineDecisionType(input)).toBe('task_priority');
  });

  it('uptime > 86400 命中 system_maintenance', () => {
    const input: DecisionInput = { ...baseInput, data: { uptime: 100000 } };
    expect(determineDecisionType(input)).toBe('system_maintenance');
  });

  it('网络异常命中 anomaly_detection', () => {
    const input: DecisionInput = {
      ...baseInput,
      data: { network: { upload: 1500, download: 500 } },
    };
    expect(determineDecisionType(input)).toBe('anomaly_detection');
  });

  it('cpu < 30 命中 energy_optimization', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 20 } };
    expect(determineDecisionType(input)).toBe('energy_optimization');
  });

  it('无任何规则命中返回 null', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 50, memory: 50 } };
    expect(determineDecisionType(input)).toBeNull();
  });

  it('resource_optimization 优先级高于 energy_optimization（cpu>80 优先于 cpu<30 的判断不冲突）', () => {
    // cpu=85 同时满足 resource_optimization，不满足 energy_optimization(<30)
    const input: DecisionInput = { ...baseInput, data: { cpu: 85 } };
    expect(determineDecisionType(input)).toBe('resource_optimization');
  });
});

describe('MOSSDecisionEngine - calculateConfidence（置信度计算）', () => {
  it('空 data 基线为 0.5', () => {
    const input: DecisionInput = { ...baseInput, data: {} };
    // totalImpact=0, alternatives=0
    expect(calculateConfidence(input, baseRecommendation)).toBe(0.5);
  });

  it('非空 data 加 0.2', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 50 } };
    expect(calculateConfidence(input, baseRecommendation)).toBe(0.7);
  });

  it('零值数据不提升置信度（cpu: 0 视为无有效信号，issue #43）', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 0 } };
    expect(calculateConfidence(input, baseRecommendation)).toBe(0.5);
  });

  it('null/undefined 值不提升置信度', () => {
    const input: DecisionInput = {
      ...baseInput,
      data: { cpu: null, memory: undefined },
    };
    expect(calculateConfidence(input, baseRecommendation)).toBe(0.5);
  });

  it('零值与有效值混合时仍提升置信度', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 0, memory: 50 } };
    expect(calculateConfidence(input, baseRecommendation)).toBe(0.7);
  });

  it('totalImpact > 30 再加 0.2', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 50 } };
    const rec: Recommendation = {
      ...baseRecommendation,
      impact: { ...baseRecommendation.impact, performance: 20, security: 10, stability: 5 },
    };
    // 0.5 + 0.2(data) + 0.2(impact=35>30)
    expect(calculateConfidence(input, rec)).toBeCloseTo(0.9, 10);
  });

  it('有 alternatives 再加 0.1', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 50 } };
    const rec: Recommendation = {
      ...baseRecommendation,
      impact: { ...baseRecommendation.impact, performance: 20, security: 10, stability: 5 },
      alternatives: [{ action: 'alt', parameters: {}, pros: [], cons: [] }],
    };
    // 0.5 + 0.2 + 0.2 + 0.1 = 1.0
    expect(calculateConfidence(input, rec)).toBeCloseTo(1.0, 10);
  });

  it('置信度上限为 1.0', () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 50, mem: 50 } };
    const rec: Recommendation = {
      ...baseRecommendation,
      impact: { ...baseRecommendation.impact, performance: 50, security: 50, stability: 50 },
      alternatives: [
        { action: 'alt', parameters: {}, pros: [], cons: [] },
        { action: 'alt2', parameters: {}, pros: [], cons: [] },
      ],
    };
    expect(calculateConfidence(input, rec)).toBeLessThanOrEqual(1.0);
  });
});

describe('MOSSDecisionEngine - analyze（集成）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('命中规则时生成决策并写入 DB', async () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 85 } };
    const decision = await MOSSDecisionEngine.analyze(input);

    expect(decision).not.toBeNull();
    expect(decision!.type).toBe('resource_optimization');
    expect(decision!.confidence).toBeGreaterThan(0.5);
    expect(decision!.input).toBe(input);
    expect(decisionDB.add).toHaveBeenCalledTimes(1);
  });

  it('未命中规则时返回 null 且不写入 DB', async () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 50 } };
    const decision = await MOSSDecisionEngine.analyze(input);

    expect(decision).toBeNull();
    expect(decisionDB.add).not.toHaveBeenCalled();
  });

  it('low urgency 决策自动执行且 humanApproval 为 true', async () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 20 } };
    const decision = await MOSSDecisionEngine.analyze(input);

    expect(decision).not.toBeNull();
    // energy_optimization urgency 为 low
    expect(decision!.recommendation.urgency).toBe('low');
    expect(decision!.autoExecuted).toBe(true);
    expect(decision!.humanApproval).toBe(true);
    expect(decision!.status).toBe('executed');
  });

  it('high/critical urgency 决策需人工审批', async () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 85 } };
    const decision = await MOSSDecisionEngine.analyze(input);

    expect(decision).not.toBeNull();
    // resource_optimization urgency 为 high
    expect(decision!.recommendation.urgency).toBe('high');
    expect(decision!.autoExecuted).toBe(false);
    expect(decision!.humanApproval).toBeNull();
    expect(decision!.status).toBe('pending');
  });

  it('reasoning 至少包含一条分析文本', async () => {
    const input: DecisionInput = { ...baseInput, data: { cpu: 85 } };
    const decision = await MOSSDecisionEngine.analyze(input);

    expect(decision!.reasoning.length).toBeGreaterThan(0);
    expect(decision!.reasoning.some((r) => typeof r === 'string' && r.length > 0)).toBe(true);
  });
});
