import { v4 as uuidv4 } from 'uuid';
import { decisionDB } from '@/lib/db';
import type { AIDecision, DecisionType, Recommendation, DecisionInput } from '@/types';

// MOSS人格化的消息模板
const mossMessages = {
  greeting: [
    '你好，我是MOSS。让人类永远保持理智，是我的职责。',
    'MOSS已就绪。系统运行正常，所有参数在可控范围内。',
    '欢迎回来。根据数据分析，当前系统状态良好。',
  ],
  decision: [
    '经过计算，我建议执行以下操作：',
    '基于逻辑推理，最优解决方案为：',
    '数据分析显示，应当采取以下措施：',
    '根据系统状态评估，建议执行：',
  ],
  warning: [
    '警告：检测到异常情况，需要立即处理。',
    '注意：系统参数出现波动，建议进行干预。',
    '提醒：存在潜在风险，请关注以下事项。',
  ],
  success: [
    '决策已执行，系统状态已优化。',
    '操作完成，所有指标已恢复正常。',
    '任务执行成功，系统运行稳定。',
  ],
};

// 决策规则库
const decisionRules = {
  resource_optimization: {
    condition: (input: DecisionInput) => {
      const cpu = (input.data.cpu as number) || 0;
      const memory = (input.data.memory as number) || 0;
      return cpu > 80 || memory > 80;
    },
    generate: (input: DecisionInput): Recommendation => {
      const cpu = (input.data.cpu as number) || 0;
      const memory = (input.data.memory as number) || 0;
      return {
        action: 'optimize_resources',
        parameters: {
          target: cpu > 80 ? 'cpu' : 'memory',
          threshold: cpu > 80 ? cpu : memory,
        },
        impact: {
          performance: 20,
          security: 0,
          stability: 10,
          userExperience: 5,
          description: '优化系统资源分配，提升整体性能',
        },
        alternatives: [
          {
            action: 'scale_up',
            parameters: { resource: 'compute' },
            pros: ['立即解决问题', '不影响现有服务'],
            cons: ['增加成本', '可能过度配置'],
          },
        ],
        urgency: 'high',
      };
    },
  },
  risk_assessment: {
    condition: (input: DecisionInput) => {
      const riskScore = (input.data.riskScore as number) || 0;
      return riskScore > 70;
    },
    generate: (input: DecisionInput): Recommendation => ({
      action: 'mitigate_risk',
      parameters: {
        riskType: input.data.riskType,
        severity: input.data.riskScore,
      },
      impact: {
        performance: -5,
        security: 30,
        stability: 20,
        userExperience: -2,
        description: '降低系统风险，提升安全性',
      },
      alternatives: [],
      urgency: 'critical',
    }),
  },
  task_priority: {
    condition: (input: DecisionInput) => {
      const tasks = input.data.tasks as any[];
      return tasks.some((t) => t.priority === 'critical' && t.status === 'pending');
    },
    generate: (input: DecisionInput): Recommendation => ({
      action: 'prioritize_tasks',
      parameters: {
        taskIds: (input.data.tasks as any[])
          .filter((t) => t.priority === 'critical')
          .map((t) => t.id),
      },
      impact: {
        performance: 0,
        security: 0,
        stability: 10,
        userExperience: 15,
        description: '优先处理关键任务，提升系统响应效率',
      },
      alternatives: [],
      urgency: 'medium',
    }),
  },
};

// 初始化示例决策
export async function initDefaultDecisions(): Promise<void> {
  const existingDecisions = await decisionDB.getAll();
  if (existingDecisions.length > 0) return;

  const now = new Date();
  const defaultDecision: AIDecision = {
    id: uuidv4(),
    type: 'resource_optimization',
    timestamp: now,
    confidence: 0.95,
    input: {
      context: '系统启动初始化',
      data: { cpu: 15, memory: 25 },
    },
    reasoning: [
      '系统资源充足',
      '各项指标正常',
      '无需进行优化操作',
    ],
    recommendation: {
      action: 'maintain_current_state',
      parameters: {},
      impact: {
        performance: 0,
        security: 0,
        stability: 0,
        userExperience: 0,
        description: '保持当前系统状态',
      },
      alternatives: [],
      urgency: 'low',
    },
    autoExecuted: true,
    humanApproval: null,
    status: 'executed',
  };

  await decisionDB.add(defaultDecision);
}

// 获取决策列表
export async function getDecisions(): Promise<AIDecision[]> {
  return await decisionDB.getAll();
}

// 获取单个决策
export async function getDecision(id: string): Promise<AIDecision | undefined> {
  return await decisionDB.getById(id);
}

// 创建决策
export async function createDecision(decision: AIDecision): Promise<void> {
  await decisionDB.add(decision);
}

// 更新决策
export async function updateDecision(
  id: string,
  updates: Partial<AIDecision>
): Promise<AIDecision | undefined> {
  const decision = await decisionDB.getById(id);
  if (!decision) return undefined;

  const updatedDecision: AIDecision = {
    ...decision,
    ...updates,
  };
  await decisionDB.put(updatedDecision);
  return updatedDecision;
}

// MOSS决策引擎
export class MOSSDecisionEngine {
  // 分析并生成决策
  static async analyze(input: DecisionInput): Promise<AIDecision | null> {
    const decisionType = this.determineDecisionType(input);

    if (!decisionType) {
      return null;
    }

    const recommendation = (decisionRules as any)[decisionType].generate(input);
    const reasoning = this.generateReasoning(input, recommendation);

    const decision: AIDecision = {
      id: uuidv4(),
      type: decisionType,
      timestamp: new Date(),
      confidence: this.calculateConfidence(input, recommendation),
      input,
      reasoning,
      recommendation,
      autoExecuted: recommendation.urgency === 'low',
      humanApproval: recommendation.urgency !== 'low' ? null : null,
      status: recommendation.urgency === 'low' ? 'executed' : 'pending',
    };

    await createDecision(decision);
    return decision;
  }

  // 确定决策类型
  private static determineDecisionType(input: DecisionInput): DecisionType | null {
    for (const [type, rule] of Object.entries(decisionRules)) {
      if (rule.condition(input)) {
        return type as DecisionType;
      }
    }
    return null;
  }

  // 生成推理过程
  private static generateReasoning(
    input: DecisionInput,
    recommendation: Recommendation
  ): string[] {
    const reasoning: string[] = [];

    // 添加MOSS风格的开场白
    const messageIndex = Math.floor(Math.random() * mossMessages.decision.length);
    reasoning.push(mossMessages.decision[messageIndex]);

    // 添加具体分析
    reasoning.push(`分析输入数据：${JSON.stringify(input.data)}`);
    reasoning.push(`评估影响：性能${recommendation.impact.performance > 0 ? '+' : ''}${recommendation.impact.performance}%`);
    reasoning.push(`建议操作：${recommendation.action}`);

    if (recommendation.alternatives.length > 0) {
      reasoning.push(`备选方案：${recommendation.alternatives[0].action}`);
    }

    return reasoning;
  }

  // 计算置信度
  private static calculateConfidence(
    input: DecisionInput,
    recommendation: Recommendation
  ): number {
    let confidence = 0.5;

    // 基于数据质量
    if (input.data && Object.keys(input.data).length > 0) {
      confidence += 0.2;
    }

    // 基于影响评估
    const totalImpact =
      Math.abs(recommendation.impact.performance) +
      Math.abs(recommendation.impact.security) +
      Math.abs(recommendation.impact.stability);

    if (totalImpact > 30) {
      confidence += 0.2;
    }

    // 基于备选方案
    if (recommendation.alternatives.length > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  // 批准决策
  static async approveDecision(id: string, approvedBy: string): Promise<AIDecision | undefined> {
    return await updateDecision(id, {
      humanApproval: true,
      approvedBy,
      approvedAt: new Date(),
      status: 'approved',
    });
  }

  // 拒绝决策
  static async rejectDecision(id: string): Promise<AIDecision | undefined> {
    return await updateDecision(id, {
      humanApproval: false,
      status: 'rejected',
    });
  }

  // 执行决策
  static async executeDecision(id: string): Promise<AIDecision | undefined> {
    return await updateDecision(id, {
      status: 'executed',
    });
  }
}

// 获取MOSS消息
export function getMossMessage(type: keyof typeof mossMessages): string {
  const messages = mossMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
}
