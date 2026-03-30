import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AIDecision, AIMetrics, MOSSMessage } from '@/types';

interface AIState {
  // 决策数据
  decisions: AIDecision[];
  selectedDecisionId: string | null;

  // MOSS消息
  messages: MOSSMessage[];

  // AI状态
  isActive: boolean;
  isThinking: boolean;
  metrics: AIMetrics;

  // 操作状态
  loading: boolean;
  error: string | null;

  // 决策操作
  setDecisions: (decisions: AIDecision[]) => void;
  addDecision: (decision: AIDecision) => void;
  updateDecision: (id: string, updates: Partial<AIDecision>) => void;
  selectDecision: (id: string | null) => void;

  // 消息操作
  addMessage: (message: Omit<MOSSMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // AI状态操作
  setActive: (active: boolean) => void;
  setThinking: (thinking: boolean) => void;
  updateMetrics: (metrics: Partial<AIMetrics>) => void;

  // 状态操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAIStore = create<AIState>()(
  immer((set) => ({
    // 初始状态
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

    // 决策操作
    setDecisions: (decisions) =>
      set((state) => {
        state.decisions = decisions;
      }),

    addDecision: (decision) =>
      set((state) => {
        state.decisions.unshift(decision);
        state.metrics.decisionsCount = state.decisions.length;
      }),

    updateDecision: (id, updates) =>
      set((state) => {
        const index = state.decisions.findIndex((d) => d.id === id);
        if (index !== -1) {
          state.decisions[index] = { ...state.decisions[index], ...updates };
        }
      }),

    selectDecision: (id) =>
      set((state) => {
        state.selectedDecisionId = id;
      }),

    // 消息操作
    addMessage: (message) =>
      set((state) => {
        state.messages.unshift({
          ...message,
          id: `message-${Date.now()}`,
          timestamp: new Date(),
        });
        // 只保留最新的100条消息
        if (state.messages.length > 100) {
          state.messages = state.messages.slice(0, 100);
        }
      }),

    clearMessages: () =>
      set((state) => {
        state.messages = [];
      }),

    // AI状态操作
    setActive: (active) =>
      set((state) => {
        state.isActive = active;
      }),

    setThinking: (thinking) =>
      set((state) => {
        state.isThinking = thinking;
      }),

    updateMetrics: (metrics) =>
      set((state) => {
        state.metrics = { ...state.metrics, ...metrics };
      }),

    // 状态操作
    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
  }))
);
