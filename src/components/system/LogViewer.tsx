'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import {
  Terminal,
  Filter,
  Trash2,
  RefreshCw,
} from 'lucide-react';

import { Panel, Button, EmptyState } from '@/components/ui';
import { useAsyncInit } from '@/hooks/useAsyncInit';
import { getSeverityStyle } from '@/lib/theme/severityTheme';
import {
  getLogs,
  clearLogs,
  initDefaultLogs,
  filterLogs,
} from '@/services/logService';
import type { LogEntry, LogLevel, LogCategory } from '@/types';

const categoryNames = {
  system: '系统',
  operation: '操作',
  task: '任务',
  ai: 'AI',
  security: '安全',
};

export const LogViewer = memo(function LogViewer() {
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 初始化日志：useAsyncInit 收敛 initDefault + 拉取
  const { data: logs, loading, refresh } = useAsyncInit<LogEntry[]>(
    async () => {
      await initDefaultLogs();
      return getLogs(200);
    },
    []
  );

  // 自动刷新：复用 useAsyncInit.refresh，保持单一数据通道
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  // 过滤日志：改用 useMemo，避免 effect 内重复 setState 触发额外渲染
  const filteredLogs = useMemo(
    () => filterLogs(
      logs ?? [],
      selectedLevel === 'all' ? undefined : selectedLevel,
      selectedCategory === 'all' ? undefined : selectedCategory,
      searchQuery
    ),
    [logs, selectedLevel, selectedCategory, searchQuery]
  );

  // 清空日志：基于返回值更新本地数据，避免二次查询
  const handleClear = async () => {
    await clearLogs();
    refresh();
  };

  return (
    <Panel
      title="系统日志"
      className="w-full h-full"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="secondary" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="danger" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      {/* 过滤器 */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-moss-cyan/20">
        <Filter className="w-4 h-4 text-moss-cyan" />

        {/* 级别过滤 */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
          className="px-2 py-1 text-xs bg-moss-cyan/10 border border-moss-cyan/30 rounded"
        >
          <option value="all">所有级别</option>
          <option value="info">信息</option>
          <option value="warning">警告</option>
          <option value="error">错误</option>
          <option value="critical">关键</option>
        </select>

        {/* 类别过滤 */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as LogCategory | 'all')}
          className="px-2 py-1 text-xs bg-moss-cyan/10 border border-moss-cyan/30 rounded"
        >
          <option value="all">所有类别</option>
          <option value="system">系统</option>
          <option value="operation">操作</option>
          <option value="task">任务</option>
          <option value="ai">AI</option>
          <option value="security">安全</option>
        </select>

        {/* 搜索 */}
        <input
          type="text"
          placeholder="搜索日志..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-1 text-xs"
        />
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-auto space-y-1 font-mono text-xs">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-moss-white/60">
            加载中...
          </div>
        ) : (
          filteredLogs.map((log) => {
            const levelStyle = getSeverityStyle(log.level);
            const LevelIcon = levelStyle.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  flex items-start gap-2 p-2 rounded border
                  ${
                    log.level === 'critical'
                      ? 'border-cyber-red/50 bg-cyber-red/5'
                      : 'border-transparent hover:border-moss-cyan/20'
                  }
                `}
              >
                {/* 级别图标 */}
                <div className={`${levelStyle.color} mt-0.5`}>
                  <LevelIcon className="w-4 h-4" />
                </div>

                {/* 时间戳 */}
                <div className="text-moss-white/40 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                </div>

                {/* 来源 */}
                <div className="text-moss-cyan whitespace-nowrap">[{log.source}]</div>

                {/* 消息 */}
                <div className="flex-1 text-moss-white/80">{log.message}</div>

                {/* 类别 */}
                <div className="text-moss-white/40 whitespace-nowrap">
                  {categoryNames[log.category]}
                </div>
              </motion.div>
            );
          })
        )}

        {filteredLogs.length === 0 && !loading && (
          <EmptyState icon={Terminal} message="暂无日志记录" className="h-32" />
        )}
      </div>

      {/* 统计 */}
      <div className="mt-4 pt-4 border-t border-moss-cyan/20 flex items-center gap-4 text-xs">
        <span className="text-moss-white/60">
          共 <span className="text-moss-cyan">{logs?.length ?? 0}</span> 条日志
        </span>
        <span className="text-moss-white/60">
          显示 <span className="text-moss-cyan">{filteredLogs.length}</span> 条
        </span>
        {(logs ?? []).filter((l) => l.level === 'critical').length > 0 && (
          <span className="text-cyber-red animate-pulse">
            {(logs ?? []).filter((l) => l.level === 'critical').length} 条关键错误
          </span>
        )}
      </div>
    </Panel>
  );
});
