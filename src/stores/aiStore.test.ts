import { describe, it, expect, beforeEach } from 'vitest';

import type { AIDecision } from '@/types';

import { useAIStore } from './aiStore';

function makeDecision(overrides: Partial<AIDecision> & { id: string }): AIDecision {
  return {
    type: 'resource_optimization',
    timestamp: new Date('2026-01-01T00:00:00Z'),
    confidence: 0.9,
    input: { context: 'test', data: {} },
    reasoning: [],
    recommendation: {
      action: 'test',
      parameters: {},
      impact: { performance: 0, security: 0, stability: 0, userExperience: 0, description: '' },
      alternatives: [],
      urgency: 'low',
    },
    autoExecuted: false,
    humanApproval: null,
    status: 'pending',
    ...overrides,
  };
}

describe('useAIStore - addDecision（store reducer）', () => {
  beforeEach(() => {
    // 重置到初始状态，避免测试间状态泄漏
    useAIStore.setState({
      decisions: [],
      selectedDecisionId: null,
      messages: [],
      isActive: false,
      isThinking: false,
      metrics: {
        decisionsCount: 0,
        successRate: 0,
        averageConfidence: 0,
        responseTime: 0,
      },
      loading: false,
      error: null,
    });
  });

  it('空仓库初始 decisionsCount 为 0', () => {
    const state = useAIStore.getState();
    expect(state.decisions).toHaveLength(0);
    expect(state.metrics.decisionsCount).toBe(0);
  });

  it('addDecision 将决策插入到数组头部', () => {
    const d1 = makeDecision({ id: 'd1' });
    const d2 = makeDecision({ id: 'd2' });

    useAIStore.getState().addDecision(d1);
    useAIStore.getState().addDecision(d2);

    const state = useAIStore.getState();
    expect(state.decisions).toHaveLength(2);
    // d2 后插入，应在头部
    expect(state.decisions[0].id).toBe('d2');
    expect(state.decisions[1].id).toBe('d1');
  });

  it('addDecision 同步更新 metrics.decisionsCount', () => {
    useAIStore.getState().addDecision(makeDecision({ id: 'd1' }));
    expect(useAIStore.getState().metrics.decisionsCount).toBe(1);

    useAIStore.getState().addDecision(makeDecision({ id: 'd2' }));
    expect(useAIStore.getState().metrics.decisionsCount).toBe(2);
  });

  it('setDecisions 批量设置并同步更新 decisionsCount', () => {
    const decisions = [makeDecision({ id: 'd1' }), makeDecision({ id: 'd2' })];
    useAIStore.getState().setDecisions(decisions);

    const state = useAIStore.getState();
    expect(state.decisions).toHaveLength(2);
    // setDecisions 同步更新 metrics.decisionsCount，避免 UI 指标不一致（issue #41）
    expect(state.metrics.decisionsCount).toBe(2);
  });

  it('setDecisions 清空列表时 decisionsCount 归零', () => {
    useAIStore.getState().addDecision(makeDecision({ id: 'd1' }));
    expect(useAIStore.getState().metrics.decisionsCount).toBe(1);

    useAIStore.getState().setDecisions([]);
    expect(useAIStore.getState().metrics.decisionsCount).toBe(0);
  });
});

describe('useAIStore - updateDecision', () => {
  beforeEach(() => {
    useAIStore.setState({
      decisions: [],
      selectedDecisionId: null,
      messages: [],
      isActive: false,
      isThinking: false,
      metrics: {
        decisionsCount: 0,
        successRate: 0,
        averageConfidence: 0,
        responseTime: 0,
      },
      loading: false,
      error: null,
    });
  });

  it('按 id 更新对应决策字段', () => {
    const d = makeDecision({ id: 'd1', status: 'pending' });
    useAIStore.getState().addDecision(d);
    useAIStore.getState().updateDecision('d1', { status: 'approved' });

    const state = useAIStore.getState();
    expect(state.decisions[0].status).toBe('approved');
  });

  it('更新不存在的 id 时无副作用', () => {
    const d = makeDecision({ id: 'd1' });
    useAIStore.getState().addDecision(d);

    useAIStore.getState().updateDecision('missing', { status: 'approved' });

    const state = useAIStore.getState();
    expect(state.decisions).toHaveLength(1);
    expect(state.decisions[0].status).toBe('pending');
  });

  it('selectDecision 设置 selectedDecisionId', () => {
    useAIStore.getState().selectDecision('d1');
    expect(useAIStore.getState().selectedDecisionId).toBe('d1');

    useAIStore.getState().selectDecision(null);
    expect(useAIStore.getState().selectedDecisionId).toBeNull();
  });
});
