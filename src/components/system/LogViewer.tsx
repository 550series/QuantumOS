'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Button } from '@/components/ui';
import {
  getLogs,
  clearLogs,
  initDefaultLogs,
  filterLogs,
} from '@/services/logService';
import type { LogEntry, LogLevel, LogCategory } from '@/types';
import {
  Info,
  AlertTriangle,
  AlertCircle,
  Zap,
  Terminal,
  Filter,
  Trash2,
  RefreshCw,
} from 'lucide-react';

// 级别图标和颜色
const levelConfig = {
  info: { icon: <Info className="w-4 h-4" />, color: 'text-moss-cyan', bg: 'bg-moss-cyan/10' },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-cyber-orange', bg: 'bg-cyber-orange/10' },
  error: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-cyber-red', bg: 'bg-cyber-red/10' },
  critical: { icon: <Zap className="w-4 h-4" />, color: 'text-cyber-red animate-pulse', bg: 'bg-cyber-red/20' },
};

const categoryNames = {
  system: '系统',
  operation: '操作',
  task: '任务',
  ai: 'AI',
  security: '安全',
};

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 初始化日志
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initDefaultLogs();
      const logs = await getLogs(200);
      setLogs(logs);
      setFilteredLogs(logs);
      setLoading(false);
    };
    init();
  }, []);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      const logs = await getLogs(200);
      setLogs(logs);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // 过滤日志
  useEffect(() => {
    const filtered = filterLogs(
      logs,
      selectedLevel === 'all' ? undefined : selectedLevel,
      selectedCategory === 'all' ? undefined : selectedCategory,
      searchQuery
    );
    setFilteredLogs(filtered);
  }, [logs, selectedLevel, selectedCategory, searchQuery]);

  // 清空日志
  const handleClear = async () => {
    await clearLogs();
    setLogs([]);
    setFilteredLogs([]);
  };

  // 刷新日志
  const handleRefresh = async () => {
    setLoading(true);
    const logs = await getLogs(200);
    setLogs(logs);
    setLoading(false);
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
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
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
          filteredLogs.map((log) => (
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
              <div className={`${levelConfig[log.level].color} mt-0.5`}>
                {levelConfig[log.level].icon}
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
          ))
        )}

        {filteredLogs.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-32 text-moss-white/40">
            <Terminal className="w-12 h-12 mb-2" />
            <p>暂无日志记录</p>
          </div>
        )}
      </div>

      {/* 统计 */}
      <div className="mt-4 pt-4 border-t border-moss-cyan/20 flex items-center gap-4 text-xs">
        <span className="text-moss-white/60">
          共 <span className="text-moss-cyan">{logs.length}</span> 条日志
        </span>
        <span className="text-moss-white/60">
          显示 <span className="text-moss-cyan">{filteredLogs.length}</span> 条
        </span>
        {logs.filter((l) => l.level === 'critical').length > 0 && (
          <span className="text-cyber-red animate-pulse">
            {logs.filter((l) => l.level === 'critical').length} 条关键错误
          </span>
        )}
      </div>
    </Panel>
  );
};
