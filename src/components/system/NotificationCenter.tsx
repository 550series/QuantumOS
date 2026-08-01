'use client';

import React, { useCallback } from 'react';

import { Bell, Trash2 } from 'lucide-react';

import { Button, EmptyState } from '@/components/ui';
import { getNotificationStyle } from '@/lib/theme/severityTheme';
import { useSystemStore } from '@/stores';

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
        <EmptyState
          icon={Bell}
          message="暂无通知"
          className="py-16"
          iconClassName="w-12 h-12"
        />
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {notifications.map((notification) => {
            const config = getNotificationStyle(notification.type);
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
