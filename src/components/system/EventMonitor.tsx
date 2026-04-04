'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from '@/components/ui/Panel/Panel';
import { Button } from '@/components/ui/Button/Button';
import { EventSystem, SystemEvent } from '@/services/eventService';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ShieldAlert,
  Activity,
  Network,
  HardDrive,
  Play,
  Pause,
} from 'lucide-react';

const eventIcons = {
  system: <Activity className="w-4 h-4" />,
  security: <ShieldAlert className="w-4 h-4" />,
  performance: <Activity className="w-4 h-4" />,
  network: <Network className="w-4 h-4" />,
  storage: <HardDrive className="w-4 h-4" />,
};

const severityColors = {
  info: 'text-moss-cyan',
  warning: 'text-cyber-orange',
  error: 'text-cyber-red',
  critical: 'text-cyber-red animate-pulse',
};

const severityLabels = {
  info: '信息',
  warning: '警告',
  error: '错误',
  critical: '严重',
};

export const EventMonitor: React.FC = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isEventSystemRunning, setIsEventSystemRunning] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);

  // 定期更新事件列表
  useEffect(() => {
    const updateEvents = () => {
      setEvents(EventSystem.getEvents());
    };

    updateEvents();
    const interval = setInterval(updateEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  // 启动/停止事件系统
  const toggleEventSystem = () => {
    if (isEventSystemRunning) {
      EventSystem.stopEventGeneration();
    } else {
      EventSystem.startEventGeneration();
    }
    setIsEventSystemRunning(!isEventSystemRunning);
  };

  // 解决事件
  const handleResolveEvent = (eventId: string) => {
    EventSystem.resolveEvent(eventId);
    setEvents(EventSystem.getEvents());
    setSelectedEvent(null);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* 事件系统控制 */}
      <Panel title="事件监控系统" glow glowColor="cyan">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-moss-cyan" />
            <span className="text-sm font-medium text-moss-white">
              事件系统
            </span>
          </div>
          <Button
            variant={isEventSystemRunning ? 'danger' : 'primary'}
            onClick={toggleEventSystem}
          >
            {isEventSystemRunning ? (
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

        {/* 事件统计 */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="p-3 border border-moss-cyan/20 rounded">
            <div className="text-xs text-moss-white/60 mb-1">总事件</div>
            <div className="text-lg font-mono text-moss-cyan">{events.length}</div>
          </div>
          <div className="p-3 border border-cyber-orange/20 rounded">
            <div className="text-xs text-moss-white/60 mb-1">警告</div>
            <div className="text-lg font-mono text-cyber-orange">
              {events.filter(e => e.severity === 'warning').length}
            </div>
          </div>
          <div className="p-3 border border-cyber-red/20 rounded">
            <div className="text-xs text-moss-white/60 mb-1">错误</div>
            <div className="text-lg font-mono text-cyber-red">
              {events.filter(e => e.severity === 'error').length}
            </div>
          </div>
          <div className="p-3 border border-cyber-red/40 rounded">
            <div className="text-xs text-moss-white/60 mb-1">严重</div>
            <div className="text-lg font-mono text-cyber-red">
              {events.filter(e => e.severity === 'critical').length}
            </div>
          </div>
        </div>
      </Panel>

      {/* 事件列表 */}
      <div className="flex-1 flex gap-4">
        {/* 左侧：事件列表 */}
        <div className="flex-1">
          <Panel title="事件列表" className="h-full overflow-hidden">
            <div className="space-y-2 h-full overflow-auto pr-2">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-moss-white/30 mb-3" />
                  <p className="text-xs text-moss-white/60">
                    {isEventSystemRunning
                      ? '等待事件生成...'
                      : '事件系统已停止'}
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      border rounded p-3 cursor-pointer transition-all
                      ${selectedEvent?.id === event.id
                        ? 'border-moss-cyan bg-moss-cyan/10 shadow-neon'
                        : `border-${severityColors[event.severity].replace('text-', '')}/20 hover:border-${severityColors[event.severity].replace('text-', '')}/40`}
                    `}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={severityColors[event.severity]}>
                          {eventIcons[event.type]}
                        </div>
                        <span className="font-medium text-moss-white">
                          {event.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${severityColors[event.severity]}`}>
                          {severityLabels[event.severity]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.resolved ? (
                          <CheckCircle className="w-4 h-4 text-cyber-green" />
                        ) : (
                          <Clock className="w-4 h-4 text-cyber-orange" />
                        )}
                        <span className="text-xs text-moss-white/60">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-moss-white/60 mb-2">
                      {event.description}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </Panel>
        </div>

        {/* 右侧：事件详情 */}
        <div className="w-80">
          <Panel title="事件详情" className="h-full">
            <AnimatePresence>
              {selectedEvent ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="p-4 border border-moss-cyan/20 rounded">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={severityColors[selectedEvent.severity]}>
                        {eventIcons[selectedEvent.type]}
                      </div>
                      <h3 className="font-medium text-moss-white">
                        {selectedEvent.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${severityColors[selectedEvent.severity]}`}>
                        {severityLabels[selectedEvent.severity]}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-moss-white/60">类型:</span>
                        <span className="text-moss-white">
                          {selectedEvent.type === 'system' ? '系统' :
                           selectedEvent.type === 'security' ? '安全' :
                           selectedEvent.type === 'performance' ? '性能' :
                           selectedEvent.type === 'network' ? '网络' : '存储'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-moss-white/60">时间:</span>
                        <span className="text-moss-white">
                          {selectedEvent.timestamp.toLocaleString()}
                        </span>
                      </div>
                      {selectedEvent.resolvedAt && (
                        <div className="flex justify-between">
                          <span className="text-moss-white/60">解决时间:</span>
                          <span className="text-moss-white">
                            {selectedEvent.resolvedAt.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedEvent.relatedTaskId && (
                        <div className="flex justify-between">
                          <span className="text-moss-white/60">相关任务:</span>
                          <span className="text-moss-cyan">
                            #{selectedEvent.relatedTaskId.slice(0, 8)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <h4 className="text-xs font-mono text-moss-cyan mb-2">描述</h4>
                      <p className="text-xs text-moss-white/80 p-3 border border-moss-cyan/20 rounded">
                        {selectedEvent.description}
                      </p>
                    </div>
                    {!selectedEvent.resolved && (
                      <Button
                        variant="primary"
                        className="w-full mt-4"
                        onClick={() => handleResolveEvent(selectedEvent.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        标记为已解决
                      </Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-moss-white/30 mb-3" />
                  <p className="text-xs text-moss-white/60">
                    选择一个事件查看详情
                  </p>
                </div>
              )}
            </AnimatePresence>
          </Panel>
        </div>
      </div>
    </div>
  );
};
