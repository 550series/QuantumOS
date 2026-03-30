'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Button } from '@/components/ui';
import {
  getAlerts,
  getActiveAlerts,
  acknowledgeAlert,
  deleteAlert,
  initDefaultAlerts,
} from '@/services/logService';
import type { Alert } from '@/types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Zap,
  Bell,
  CheckCircle,
  Trash2,
  XCircle,
} from 'lucide-react';

// 级别配置
const severityConfig = {
  info: { icon: <Info className="w-5 h-5" />, color: 'text-moss-cyan', bg: 'bg-moss-cyan/10', border: 'border-moss-cyan/30' },
  warning: { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-cyber-orange', bg: 'bg-cyber-orange/10', border: 'border-cyber-orange/30' },
  error: { icon: <AlertCircle className="w-5 h-5" />, color: 'text-cyber-red', bg: 'bg-cyber-red/10', border: 'border-cyber-red/30' },
  critical: { icon: <Zap className="w-5 h-5" />, color: 'text-cyber-red', bg: 'bg-cyber-red/20', border: 'border-cyber-red/50' },
};

export const AlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(false);

  // 初始化警报
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initDefaultAlerts();
      const allAlerts = await getAlerts(100);
      const active = await getActiveAlerts();
      setAlerts(allAlerts);
      setActiveAlerts(active);
      setLoading(false);
    };
    init();
  }, []);

  // 确认警报
  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id, 'user');
    const allAlerts = await getAlerts(100);
    const active = await getActiveAlerts();
    setAlerts(allAlerts);
    setActiveAlerts(active);
    setSelectedAlert(null);
  };

  // 删除警报
  const handleDelete = async (id: string) => {
    await deleteAlert(id);
    const allAlerts = await getAlerts(100);
    const active = await getActiveAlerts();
    setAlerts(allAlerts);
    setActiveAlerts(active);
  };

  return (
    <>
      {/* 活动警报横幅 */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-3 mb-4 border-l-4 border-cyber-red"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyber-red animate-pulse" />
                <span className="font-medium text-cyber-red">
                  {activeAlerts.length} 条未处理警报
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setSelectedAlert(activeAlerts[0])}
              >
                查看
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 警报列表 */}
      <Panel
        title="系统警报"
        className="w-full h-full"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-moss-white/60">
              {activeAlerts.length} 未处理
            </span>
          </div>
        }
      >
        <div className="space-y-2 h-full overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-moss-white/60">
              加载中...
            </div>
          ) : (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`
                  border rounded p-3 cursor-pointer transition-all
                  ${!alert.acknowledged ? severityConfig[alert.severity].border : 'border-moss-cyan/10'}
                  ${!alert.acknowledged ? severityConfig[alert.severity].bg : 'bg-transparent'}
                  ${selectedAlert?.id === alert.id ? 'ring-2 ring-moss-cyan' : ''}
                `}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start gap-3">
                  {/* 图标 */}
                  <div className={`${severityConfig[alert.severity].color} mt-0.5`}>
                    {severityConfig[alert.severity].icon}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-moss-white truncate">
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {alert.acknowledged && (
                          <CheckCircle className="w-4 h-4 text-cyber-green" />
                        )}
                        <span className="text-xs text-moss-white/40">
                          {new Date(alert.timestamp).toLocaleTimeString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-moss-white/60 mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-moss-cyan">{alert.source}</span>
                      <div className="flex items-center gap-1">
                        {!alert.acknowledged && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleAcknowledge(alert.id);
                            }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            确认
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDelete(alert.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {alerts.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-32 text-moss-white/40">
              <CheckCircle className="w-12 h-12 mb-2" />
              <p>无警报</p>
            </div>
          )}
        </div>
      </Panel>

      {/* 警报详情弹窗 */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`${severityConfig[selectedAlert.severity].color}`}>
                  {severityConfig[selectedAlert.severity].icon}
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg text-moss-white mb-1">
                    {selectedAlert.title}
                  </h2>
                  <p className="text-xs text-moss-white/60">
                    {new Date(selectedAlert.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              <p className="text-sm text-moss-white/80 mb-4">
                {selectedAlert.message}
              </p>

              <div className="text-xs text-moss-cyan mb-4">
                来源: {selectedAlert.source}
              </div>

              {selectedAlert.actions && selectedAlert.actions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-moss-white/60 mb-2">可用操作:</p>
                  <div className="space-y-1">
                    {selectedAlert.actions.map((action, index) => (
                      <div
                        key={index}
                        className="text-xs text-moss-cyan bg-moss-cyan/10 p-2 rounded"
                      >
                        {action.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                {!selectedAlert.acknowledged && (
                  <Button
                    variant="primary"
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    确认警报
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setSelectedAlert(null)}>
                  关闭
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
