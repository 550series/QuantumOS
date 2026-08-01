'use client';

import React, { memo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores';
import {
  getTasks,
  createTask,
  deleteTask,
  startTask,
  cancelTask,
  initDefaultTasks,
} from '@/services/taskService';
import { Panel, Button, EmptyState, SelectableCard } from '@/components/ui';
import { getTaskStatusStyle, getTaskPriorityColor } from '@/lib/theme/severityTheme';
import { useAsyncInit } from '@/lib/hooks/useAsyncInit';
import type { Task } from '@/types';
import { Play, Square, Trash2, Plus, Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

export const TaskScheduler = memo(function TaskScheduler() {
  const { tasks, stats, selectedTaskId, setTasks, selectTask, updateStats } = useTaskStore();

  // 变更后重拉任务列表 + 重算统计，替代各 handler 中重复的 getTasks + setTasks + updateStats
  const refreshTasks = useCallback(async () => {
    setTasks(await getTasks());
    updateStats();
  }, [setTasks, updateStats]);

  // 初始化任务
  const { loading } = useAsyncInit(async () => {
    await initDefaultTasks();
    await refreshTasks();
  }, []);

  // 定期更新统计数据（静默拉取，不触发 loading）
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTasks();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshTasks]);

  // 创建新任务
  const handleCreateTask = async () => {
    await createTask({
      name: '新任务',
      description: '任务描述',
      status: 'pending',
      priority: 'normal',
      progress: 0,
      dependencies: [],
      scheduledAt: null,
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
      resources: { cpu: 0, memory: 0, network: 0 },
      metadata: {},
    });
    await refreshTasks();
  };

  // 启动任务
  const handleStartTask = async (id: string) => {
    await startTask(id);
    await refreshTasks();
  };

  // 取消任务
  const handleCancelTask = async (id: string) => {
    await cancelTask(id);
    await refreshTasks();
  };

  // 删除任务
  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    await refreshTasks();
    selectTask(null);
  };

  return (
    <Panel title="任务调度器" className="w-full h-full">
      {/* 统计概览 */}
      <div className="grid grid-cols-6 gap-3 mb-4 pb-4 border-b border-moss-cyan/20">
        <div className="text-center">
          <div className="text-2xl font-bold text-moss-cyan">{stats.total}</div>
          <div className="text-xs text-moss-white/60">总任务</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-moss-white/60">{stats.pending}</div>
          <div className="text-xs text-moss-white/60">等待中</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyber-green">{stats.running}</div>
          <div className="text-xs text-moss-white/60">运行中</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-moss-cyan">{stats.completed}</div>
          <div className="text-xs text-moss-white/60">已完成</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyber-red">{stats.failed}</div>
          <div className="text-xs text-moss-white/60">失败</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-moss-white/40">{stats.cancelled}</div>
          <div className="text-xs text-moss-white/60">已取消</div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-moss-white/80">任务列表</h3>
        <Button variant="secondary" size="sm" onClick={handleCreateTask}>
          <Plus className="w-4 h-4 mr-1" />
          新建任务
        </Button>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-moss-white/60">加载中...</div>
        ) : (
          tasks.map((task) => {
            const statusStyle = getTaskStatusStyle(task.status);
            const StatusIcon = statusStyle.icon;
            return (
              <SelectableCard
                key={task.id}
                selected={selectedTaskId === task.id}
                onClick={() => selectTask(task.id)}
                className="border-moss-cyan/20 hover:border-moss-cyan/40"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={statusStyle.color}>
                      <StatusIcon className={`w-4 h-4 ${statusStyle.iconClassName ?? ''}`} />
                    </div>
                    <span className="font-medium text-moss-white">{task.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getTaskPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {task.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleStartTask(task.id);
                        }}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                    {task.status === 'running' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleCancelTask(task.id);
                        }}
                      >
                        <Square className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-cyber-red" />
                    </Button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-moss-white/60 mb-2">{task.description}</p>
                )}

                {/* 进度条 */}
                {task.status === 'running' && (
                  <div className="mb-2">
                    <div className="h-1 bg-moss-cyan/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-cyber-green"
                        style={{ width: `${task.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="text-xs text-moss-white/60 mt-1">{task.progress}%</div>
                  </div>
                )}

                {/* 资源使用 */}
                <div className="flex items-center gap-4 text-xs text-moss-white/60">
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>{task.resources.cpu.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    <span>{task.resources.memory.toFixed(0)}MB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>{task.resources.network.toFixed(0)}KB/s</span>
                  </div>
                </div>

                {task.error && (
                  <div className="mt-2 text-xs text-cyber-red bg-cyber-red/10 p-2 rounded">
                    {task.error}
                  </div>
                )}
              </SelectableCard>
            );
          })
        )}

        {tasks.length === 0 && !loading && (
          <EmptyState
            className="h-32"
            icon={<Activity className="w-12 h-12 mb-2" />}
            title="暂无任务"
          />
        )}
      </div>
    </Panel>
  );
});
