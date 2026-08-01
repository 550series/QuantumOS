'use client';

import React, { memo, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  Trash2,
} from 'lucide-react';

import { Panel, Button, EmptyState, SelectableCard } from '@/components/ui';
import { useAsyncInit } from '@/hooks/useAsyncInit';
import { getSeverityStyle } from '@/lib/theme/severityTheme';
import {
  getAlerts,
  getActiveAlerts,
  acknowledgeAlert,
  deleteAlert,
  initDefaultAlerts,
} from '@/services/logService';
import type { Alert } from '@/types';

interface AlertsSnapshot {
  alerts: Alert[];
  active: Alert[];
}

async function loadAlertsSnapshot(): Promise<AlertsSnapshot> {
  await initDefaultAlerts();
  const [alerts, active] = await Promise.all([getAlerts(100), getActiveAlerts()]);
  return { alerts, active };
}

export const AlertSystem = memo(function AlertSystem() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // 初始化警报：useAsyncInit 收敛 initDefault + 拉取全量与活动列表
  const { data, loading, refresh } = useAsyncInit<AlertsSnapshot>(
    loadAlertsSnapshot,
    []
  );

  const alerts = data?.alerts ?? [];
  const activeAlerts = data?.active ?? [];

  // 确认警报：基于返回值更新本地数据，避免二次查询
  const handleAcknowledge = async (id: string) => {
    const updated = await acknowledgeAlert(id, 'user');
    if (updated) {
      refresh();
    }
    setSelectedAlert(null);
  };

  // 删除警报：基于 id 更新本地数据，避免二次查询
  const handleDelete = async (id: string) => {
    await deleteAlert(id);
    refresh();
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
            alerts.map((alert) => {
              const severityStyle = getSeverityStyle(alert.severity);
              const SeverityIcon = severityStyle.icon;
              return (
                <SelectableCard
                  key={alert.id}
                  selected={selectedAlert?.id === alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  borderClassName={
                    !alert.acknowledged
                      ? `${severityStyle.border} ${severityStyle.bg}`
                      : 'border-moss-cyan/10 bg-transparent'
                  }
                  disableMotion
                >
                  <div className="flex items-start gap-3">
                    {/* 图标 */}
                    <div className={`${severityStyle.color} mt-0.5`}>
                      <SeverityIcon className="w-5 h-5" />
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
                </SelectableCard>
              );
            })
          )}

          {alerts.length === 0 && !loading && (
            <EmptyState icon={CheckCircle} message="无警报" className="h-32" />
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
                {(() => {
                  const severityStyle = getSeverityStyle(selectedAlert.severity);
                  const SeverityIcon = severityStyle.icon;
                  return (
                    <div className={severityStyle.color}>
                      <SeverityIcon className="w-5 h-5" />
                    </div>
                  );
                })()}
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
});
