'use client';

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Button, EmptyState, SelectableCard } from '@/components/ui';
import {
  getAlerts,
  getActiveAlerts,
  acknowledgeAlert,
  deleteAlert,
  initDefaultAlerts,
} from '@/services/logService';
import { getSeverityStyle } from '@/lib/theme/severityTheme';
import { useAsyncInit } from '@/lib/hooks/useAsyncInit';
import type { Alert } from '@/types';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';

export const AlertSystem = memo(function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // 初始化 + 变更后刷新复用同一流程
  const { loading, refresh } = useAsyncInit(async () => {
    await initDefaultAlerts();
    setAlerts(await getAlerts(100));
    setActiveAlerts(await getActiveAlerts());
  });

  // 确认警报
  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id, 'user');
    await refresh();
    setSelectedAlert(null);
  };

  // 删除警报
  const handleDelete = async (id: string) => {
    await deleteAlert(id);
    await refresh();
  };

  const selectedSev = selectedAlert ? getSeverityStyle(selectedAlert.severity) : null;
  const SelectedSevIcon = selectedSev?.icon;

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
              <Button variant="danger" size="sm" onClick={() => setSelectedAlert(activeAlerts[0])}>
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
            <span className="text-xs text-moss-white/60">{activeAlerts.length} 未处理</span>
          </div>
        }
      >
        <div className="space-y-2 h-full overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-moss-white/60">
              加载中...
            </div>
          ) : (
            alerts.map((alert) => {
              const sev = getSeverityStyle(alert.severity);
              const SevIcon = sev.icon;
              const accent = !alert.acknowledged
                ? `${sev.border} ${sev.bg}`
                : 'border-moss-cyan/10 bg-transparent';
              return (
                <SelectableCard
                  key={alert.id}
                  selected={selectedAlert?.id === alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={accent}
                  selectedClassName="ring-2 ring-moss-cyan"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex items-start gap-3">
                    {/* 图标 */}
                    <div className={`${sev.color} mt-0.5`}>
                      <SevIcon className="w-5 h-5" />
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-moss-white truncate">{alert.title}</h3>
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
                </SelectableCard>
              );
            })
          )}

          {alerts.length === 0 && !loading && (
            <EmptyState
              className="h-32"
              icon={<CheckCircle className="w-12 h-12 mb-2" />}
              title="无警报"
            />
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
                {selectedSev && SelectedSevIcon && (
                  <div className={`${selectedSev.color}`}>
                    <SelectedSevIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-display text-lg text-moss-white mb-1">
                    {selectedAlert.title}
                  </h2>
                  <p className="text-xs text-moss-white/60">
                    {new Date(selectedAlert.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              <p className="text-sm text-moss-white/80 mb-4">{selectedAlert.message}</p>

              <div className="text-xs text-moss-cyan mb-4">来源: {selectedAlert.source}</div>

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
                  <Button variant="primary" onClick={() => handleAcknowledge(selectedAlert.id)}>
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
});
