// AI决策系统类型定义

export type DecisionType =
  | 'resource_optimization'
  | 'risk_assessment'
  | 'task_priority'
  | 'system_maintenance'
  | 'anomaly_detection';

export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'executed';

export interface AIDecision {
  id: string;
  type: DecisionType;
  timestamp: Date;
  confidence: number; // 0-1
  input: DecisionInput;
  reasoning: string[];
  recommendation: Recommendation;
  autoExecuted: boolean;
  humanApproval: boolean | null;
  status: DecisionStatus;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface DecisionInput {
  context: string;
  data: Record<string, unknown>;
  constraints?: Record<string, unknown>;
}

export interface Recommendation {
  action: string;
  parameters: Record<string, unknown>;
  impact: ImpactAssessment;
  alternatives: Alternative[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface ImpactAssessment {
  performance: number; // -100 to 100
  security: number;
  stability: number;
  userExperience: number;
  description: string;
}

export interface Alternative {
  action: string;
  parameters: Record<string, unknown>;
  pros: string[];
  cons: string[];
}

export interface AIMetrics {
  decisionsCount: number;
  successRate: number;
  averageConfidence: number;
  responseTime: number; // ms
}

export interface MOSSMessage {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'critical' | 'decision' | 'success';
  content: string;
  action?: string;
  data?: Record<string, unknown>;
}
