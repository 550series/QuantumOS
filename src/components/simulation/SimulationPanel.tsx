'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Panel } from '@/components/ui/Panel/Panel';
import { Button } from '@/components/ui/Button/Button';
import { SimulationSystem, ScenarioType } from '@/services/simulationService';
import { useSystemStore } from '@/stores';
import {
  Play,
  Pause,
  AlertTriangle,
  Zap,
  ShieldAlert,
  TrendingUp,
  Clock,
  Activity,
} from 'lucide-react';

const scenarioIcons = {
  normal: <TrendingUp className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  emergency: <ShieldAlert className="w-4 h-4" />,
  optimization: <Zap className="w-4 h-4" />,
};

const scenarioColors = {
  normal: 'text-moss-cyan',
  warning: 'text-cyber-orange',
  emergency: 'text-cyber-red',
  optimization: 'text-cyber-green',
};

export const SimulationPanel: React.FC = () => {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState(SimulationSystem.getActiveScenario());
  const [scenarioHistory, setScenarioHistory] = useState<Array<{
    scenario: typeof activeScenario;
    timestamp: Date;
  }>>([]);
  const { status } = useSystemStore();

  // 监听活动场景变化
  useEffect(() => {
    const checkActiveScenario = () => {
      const current = SimulationSystem.getActiveScenario();
      if (current !== activeScenario) {
        setActiveScenario(current);
        if (current) {
          setScenarioHistory(prev => [
            { scenario: current, timestamp: new Date() },
            ...prev.slice(0, 9), // 只保留最近10条
          ]);
        }
      }
    };

    const interval = setInterval(checkActiveScenario, 2000);
    return () => clearInterval(interval);
  }, [activeScenario]);

  // 启动/停止模拟
  const toggleSimulation = () => {
    if (isSimulationRunning) {
      SimulationSystem.stopSimulation();
    } else {
      SimulationSystem.startSimulation();
    }
    setIsSimulationRunning(!isSimulationRunning);
  };

  // 手动触发场景
  const handleTriggerScenario = (type: ScenarioType) => {
    SimulationSystem.triggerManualScenario(type);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* 模拟控制 */}
      <Panel title="模拟系统控制" glow glowColor="cyan">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-moss-cyan" />
            <span className="text-sm font-medium text-moss-white">
              模拟系统
            </span>
          </div>
          <Button
            variant={isSimulationRunning ? 'danger' : 'primary'}
            onClick={toggleSimulation}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                停止
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                启动
              </>
            )}
          </Button>
        </div>

        {/* 系统状态 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 border border-moss-cyan/20 rounded">
            <div className="text-xs text-moss-white/60 mb-1">CPU 使用率</div>
            <div className="flex items-end gap-2">
              <span className="text-lg font-mono text-moss-cyan">
                {Math.round(status.cpu)}%
              </span>
              <div className="flex-1 h-1 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-moss-cyan to-cyber-green"
                  style={{ width: `${Math.min(status.cpu, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="p-3 border border-moss-cyan/20 rounded">
            <div className="text-xs text-moss-white/60 mb-1">内存使用率</div>
            <div className="flex items-end gap-2">
              <span className="text-lg font-mono text-moss-cyan">
                {Math.round(status.memory.percentage)}%
              </span>
              <div className="flex-1 h-1 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-moss-cyan to-cyber-green"
                  style={{ width: `${Math.min(status.memory.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 场景触发按钮 */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            className="justify-start"
            onClick={() => handleTriggerScenario('normal')}
          >
            <div className={`mr-2 ${scenarioColors.normal}`}>
              {scenarioIcons.normal}
            </div>
            常规运行
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            onClick={() => handleTriggerScenario('warning')}
          >
            <div className={`mr-2 ${scenarioColors.warning}`}>
              {scenarioIcons.warning}
            </div>
            CPU负载增加
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            onClick={() => handleTriggerScenario('emergency')}
          >
            <div className={`mr-2 ${scenarioColors.emergency}`}>
              {scenarioIcons.emergency}
            </div>
            资源耗尽
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            onClick={() => handleTriggerScenario('optimization')}
          >
            <div className={`mr-2 ${scenarioColors.optimization}`}>
              {scenarioIcons.optimization}
            </div>
            优化机会
          </Button>
        </div>
      </Panel>

      {/* 当前场景 */}
      <Panel title="当前场景" className="flex-1 overflow-hidden">
        {activeScenario ? (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border rounded ${scenarioColors[activeScenario.type]}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={scenarioColors[activeScenario.type]}>
                  {scenarioIcons[activeScenario.type]}
                </div>
                <h3 className="font-medium text-moss-white">
                  {activeScenario.name}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded ${scenarioColors[activeScenario.type]}`}>
                  {activeScenario.type === 'normal' ? '常规' :
                   activeScenario.type === 'warning' ? '警告' :
                   activeScenario.type === 'emergency' ? '紧急' : '优化'}
                </span>
              </div>
              <p className="text-xs text-moss-white/60 mb-3">
                {activeScenario.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-moss-white/60" />
                  <span className="text-moss-white/60">持续时间:</span>
                  <span className="text-moss-cyan">
                    {Math.round((Date.now() - (activeScenario.startTime?.getTime() || 0)) / 1000)}s
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-moss-white/60" />
                  <span className="text-moss-white/60">CPU:</span>
                  <span className="text-moss-cyan">{activeScenario.systemImpact.cpu}%</span>
                </div>
              </div>
            </motion.div>

            {/* 场景历史 */}
            <div>
              <h4 className="text-xs font-mono text-moss-cyan mb-2">场景历史</h4>
              <div className="space-y-2 max-h-40 overflow-auto">
                {scenarioHistory.map((item, index) => (
                  <div key={index} className="text-xs p-2 border border-moss-cyan/20 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={scenarioColors[item.scenario?.type || 'normal']}>
                          {scenarioIcons[item.scenario?.type || 'normal']}
                        </div>
                        <span className="text-moss-white">
                          {item.scenario?.name || '未知场景'}
                        </span>
                      </div>
                      <span className="text-moss-white/60">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-moss-white/30 mb-3" />
            <p className="text-xs text-moss-white/60">
              {isSimulationRunning
                ? '等待场景触发...'
                : '模拟系统已停止'}
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
};
