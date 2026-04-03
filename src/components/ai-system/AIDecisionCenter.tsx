'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIStore } from '@/stores';
import {
  initDefaultDecisions,
  getDecisions,
  MOSSDecisionEngine,
  getMossMessage,
  getMossAnalysisMessage,
  getMossInfoMessage,
} from '@/lib/ai/decisionEngine';
import { Panel } from '@/components/ui/Panel/Panel';
import { Button } from '@/components/ui/Button/Button';
import type { AIDecision } from '@/types';
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Activity,
  Zap,
} from 'lucide-react';

// 决策类型映射
const decisionTypeNames = {
  resource_optimization: '资源优化',
  risk_assessment: '风险评估',
  task_priority: '任务优先级',
  system_maintenance: '系统维护',
  anomaly_detection: '异常检测',
  energy_optimization: '能源优化',
};

const urgencyColors = {
  low: 'text-moss-white/60',
  medium: 'text-cyber-orange',
  high: 'text-cyber-red',
  critical: 'text-cyber-red animate-pulse',
};

export const AIDecisionCenter: React.FC = () => {
  const {
    decisions,
    messages,
    isActive,
    isThinking,
    metrics,
    setDecisions,
    addMessage,
    setActive,
    setThinking,
    updateMetrics,
  } = useAIStore();

  const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null);
  const [mossGreeting, setMossGreeting] = useState('');

  // 初始化
  useEffect(() => {
    const init = async () => {
      await initDefaultDecisions();
      const decisions = await getDecisions();
      setDecisions(decisions);
      setActive(true);

      // MOSS欢迎消息
      setMossGreeting(getMossMessage('greeting'));

      // 添加初始消息
      addMessage({
        type: 'info',
        content: 'MOSS人工智能决策系统已启动',
      });

      // 更新指标
      updateMetrics({
        decisionsCount: decisions.length,
        successRate: decisions.filter((d) => d.status === 'executed').length / decisions.length,
        averageConfidence:
          decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length,
        responseTime: 250,
      });
    };
    init();
  }, [setDecisions, setActive, addMessage, updateMetrics]);

  // 批准决策
  const handleApprove = async (decisionId: string) => {
    setThinking(true);
    await MOSSDecisionEngine.approveDecision(decisionId, 'user');

    const updated = await getDecisions();
    setDecisions(updated);
    setSelectedDecision(null);
    setThinking(false);

    addMessage({
      type: 'success',
      content: '决策已批准，系统将执行相应操作',
    });
  };

  // 拒绝决策
  const handleReject = async (decisionId: string) => {
    setThinking(true);
    await MOSSDecisionEngine.rejectDecision(decisionId);

    const updated = await getDecisions();
    setDecisions(updated);
    setSelectedDecision(null);
    setThinking(false);

    addMessage({
      type: 'warning',
      content: '决策已拒绝，系统将保持当前状态',
    });
  };

  // 触发新的决策分析
  const handleNewAnalysis = async () => {
    setThinking(true);
    addMessage({
      type: 'info',
      content: '正在分析系统状态...',
    });

    // 模拟系统数据分析
    const input = {
      context: '用户手动触发分析',
      data: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        tasks: [],
      },
    };

    const decision = await MOSSDecisionEngine.analyze(input);

    if (decision) {
      addMessage({
        type: 'decision',
        content: `${getMossMessage('decision')}新决策已生成：${decisionTypeNames[decision.type]}`,
        action: decision.id,
      });

      addMessage({
        type: 'info',
        content: getMossAnalysisMessage(),
      });

      const updated = await getDecisions();
      setDecisions(updated);
      updateMetrics({
        decisionsCount: updated.length,
      });
    } else {
      addMessage({
        type: 'info',
        content: getMossInfoMessage(),
      });
    }

    setThinking(false);
  };

  return (
    <div className="w-full h-full flex gap-4">
      {/* 左侧：MOSS核心 */}
      <div className="w-80 flex flex-col gap-4">
        {/* MOSS状态 */}
        <Panel title="MOSS核心" glow glowColor="cyan">
          <div className="text-center">
            <motion.div
              animate={{
                scale: isActive ? [1, 1.05, 1] : 1,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <Brain className="w-16 h-16 mx-auto text-moss-cyan" />
            </motion.div>
            <h2 className="font-display text-2xl text-moss-cyan mb-2">MOSS</h2>
            <p className="text-xs text-moss-white/60 mb-4">人工智能决策系统</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-cyber-green' : 'bg-moss-white/30'
                }`}
              />
              <span className="text-xs text-moss-white/80">
                {isActive ? '在线' : '离线'}
              </span>
              {isThinking && (
                <span className="text-xs text-cyber-green animate-pulse ml-2">
                  思考中...
                </span>
              )}
            </div>
          </div>

          {/* 指标 */}
          <div className="space-y-2 border-t border-moss-cyan/20 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-moss-white/60">决策数量</span>
              <span className="text-moss-cyan">{metrics.decisionsCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-moss-white/60">成功率</span>
              <span className="text-cyber-green">
                {(metrics.successRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-moss-white/60">平均置信度</span>
              <span className="text-moss-cyan">
                {(metrics.averageConfidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full mt-4"
            onClick={handleNewAnalysis}
            isLoading={isThinking}
          >
            <Activity className="w-4 h-4 mr-2" />
            触发分析
          </Button>
        </Panel>

        {/* MOSS消息 */}
        <Panel title="MOSS消息" className="flex-1 overflow-hidden">
          <div className="space-y-2 h-full overflow-auto">
            {mossGreeting && (
              <div className="text-xs text-moss-cyan bg-moss-cyan/10 p-2 rounded mb-2">
                {mossGreeting}
              </div>
            )}
            {messages.slice(0, 10).map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  text-xs p-2 rounded border
                  ${
                    message.type === 'info'
                      ? 'border-moss-cyan/20 text-moss-white/80'
                      : message.type === 'success'
                      ? 'border-cyber-green/20 text-cyber-green'
                      : message.type === 'warning'
                      ? 'border-cyber-orange/20 text-cyber-orange'
                      : 'border-cyber-red/20 text-cyber-red'
                  }
                `}
              >
                {message.content}
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>

      {/* 右侧：决策列表 */}
      <div className="flex-1 flex flex-col gap-4">
        <Panel title="决策历史" className="flex-1 overflow-hidden">
          <div className="space-y-3 h-full overflow-auto pr-2">
            {decisions.map((decision) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  border rounded p-3 cursor-pointer transition-all
                  ${
                    selectedDecision?.id === decision.id
                      ? 'border-moss-cyan bg-moss-cyan/10 shadow-neon'
                      : 'border-moss-cyan/20 hover:border-moss-cyan/40'
                  }
                `}
                onClick={() => setSelectedDecision(decision)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${urgencyColors[decision.recommendation.urgency]}`} />
                    <span className="font-medium text-moss-white">
                      {decisionTypeNames[decision.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-moss-white/60">
                      {(decision.confidence * 100).toFixed(0)}%
                    </span>
                    {decision.status === 'executed' && (
                      <CheckCircle className="w-4 h-4 text-cyber-green" />
                    )}
                    {decision.status === 'pending' && (
                      <Clock className="w-4 h-4 text-cyber-orange" />
                    )}
                    {decision.status === 'rejected' && (
                      <XCircle className="w-4 h-4 text-cyber-red" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-moss-white/60 mb-2">
                  {decision.recommendation.impact.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-moss-white/60">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      性能{decision.recommendation.impact.performance > 0 ? '+' : ''}
                      {decision.recommendation.impact.performance}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>稳定性+{decision.recommendation.impact.stability}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>

        {/* 决策详情 */}
        <AnimatePresence>
          {selectedDecision && selectedDecision.status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-panel p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-moss-cyan">决策确认</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(selectedDecision.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    拒绝
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(selectedDecision.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    批准
                  </Button>
                </div>
              </div>
              <div className="text-xs text-moss-white/80 space-y-1">
                {selectedDecision.reasoning.map((reason, index) => (
                  <p key={index}>{reason}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
