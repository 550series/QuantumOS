'use client';

import React, { useCallback } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Trash2 } from 'lucide-react';
import { useSystemStore } from '@/stores';
import { Button } from '@/components/ui';

const typeConfig = {
  info: { icon: Info, color: 'text-moss-cyan', bg: 'bg-moss-cyan/10', border: 'border-moss-cyan/30' },
  success: { icon: CheckCircle, color: 'text-cyber-green', bg: 'bg-cyber-green/10', border: 'border-cyber-green/30' },
  warning: { icon: AlertTriangle, color: 'text-cyber-orange', bg: 'bg-cyber-orange/10', border: 'border-cyber-orange/30' },
  error: { icon: XCircle, color: 'text-cyber-red', bg: 'bg-cyber-red/10', border: 'border-cyber-red/30' },
};

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useSystemStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = useCallback(() => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
  }, [notifications, markNotificationRead]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-moss-cyan" />
          <h2 className="text-xl font-mono text-moss-cyan">通知中心</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-mono bg-cyber-red text-moss-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            全部已读
          </Button>
          <Button variant="ghost" size="sm" onClick={clearNotifications}>
            <Trash2 className="w-3 h-3 mr-1" />
            清空
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-moss-white/40">
          <Bell className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-mono text-sm">暂无通知</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`p-3 border rounded transition-all ${config.border} ${config.bg} ${!notification.read ? 'ring-1 ring-moss-cyan/20' : 'opacity-70'}`}
                onClick={() => !notification.read && markNotificationRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-moss-white">{notification.title}</span>
                      <span className="font-mono text-xs text-moss-white/40">
                        {new Date(notification.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-moss-white/60 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.action && (
                      <button
                        className="mt-2 font-mono text-xs text-moss-cyan hover:text-moss-white border border-moss-cyan/30 hover:border-moss-cyan px-2 py-1 rounded transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.action?.onClick?.();
                        }}
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-moss-cyan flex-shrink-0 mt-1 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};