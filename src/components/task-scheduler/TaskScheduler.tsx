'use client';

import React, { memo, useEffect } from 'react';

import { motion } from 'framer-motion';
import {
  Play,
  Square,
  Trash2,
  Plus,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  Link2,
  Hourglass,
} from 'lucide-react';

import { Panel, Button, EmptyState, SelectableCard } from '@/components/ui';
import { useAsyncInit } from '@/hooks/useAsyncInit';
import {
  getTaskStatusStyle,
  taskStatusIconClassName,
  taskPriorityColors,
} from '@/lib/theme/severityTheme';
import {
  getTasks,
  createTask,
  deleteTask,
  startTask,
  cancelTask,
  initDefaultTasks,
} from '@/services/taskService';
import { useTaskStore, useSystemStore } from '@/stores';
import type { Task } from '@/types';


export const TaskScheduler = memo(function TaskScheduler() {
  const {
    tasks,
    stats,
    selectedTaskId,
    setTasks,
    selectTask,
    updateTask,
    deleteTask: deleteTaskFromStore,
  } = useTaskStore();

  // 初始化任务：useAsyncInit 收敛 initDefault + 拉取；setTasks 内部已更新 stats
  const { loading, refresh } = useAsyncInit<Task[]>(
    async () => {
      await initDefaultTasks();
      const tasks = await getTasks();
      setTasks(tasks);
      return tasks;
    },
    [setTasks]
  );

  // 定期拉取任务（外部模拟任务进度会修改 DB，需周期同步）
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [refresh]);

  // 创建新任务：基于返回值直接更新 store，避免二次查询
  const handleCreateTask = async () => {
    const task = await createTask({
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
    useTaskStore.getState().addTask(task);
  };

  // 取消任务：基于返回值直接更新 store，避免二次查询
  const handleCancelTask = async (id: string) => {
    const updated = await cancelTask(id);
    if (updated) updateTask(id, updated);
  };

  // 删除任务：基于 id 直接更新 store，避免二次查询
  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    deleteTaskFromStore(id);
  };

  // issue #49：依赖辅助函数
  const taskById = (id: string) => tasks.find((t) => t.id === id);
  const isDependencySatisfied = (task: Task) =>
    task.dependencies.every((depId) => {
      const dep = taskById(depId);
      return !dep || dep.status === 'completed';
    });
  const selectedTask = selectedTaskId ? taskById(selectedTaskId) : undefined;

  // issue #49：依赖未满足时禁止启动
  const handleStartTask = async (id: string) => {
    const task = taskById(id);
    if (task && !isDependencySatisfied(task)) {
      useSystemStore.getState().addNotification({
        title: '依赖未满足',
        message: '任务的前置依赖尚未全部完成，无法启动。',
        type: 'warning',
      });
      return;
    }
    const updated = await startTask(id);
    if (updated) updateTask(id, updated);
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
          <div className="flex items-center justify-center h-32 text-moss-white/60">
            加载中...
          </div>
        ) : (
          tasks.map((task) => {
            const statusStyle = getTaskStatusStyle(task.status);
            const StatusIcon = statusStyle.icon;
            return (
              <SelectableCard
                key={task.id}
                selected={selectedTaskId === task.id}
                onClick={() => selectTask(task.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={statusStyle.color}>
                      <StatusIcon className={`w-4 h-4 ${taskStatusIconClassName[task.status]}`} />
                    </div>
                    <span className="font-medium text-moss-white">{task.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${taskPriorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {task.status === 'pending' && isDependencySatisfied(task) && (
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
                    {task.status === 'pending' && !isDependencySatisfied(task) && (
                      <span
                        title="等待依赖完成"
                        className="flex items-center gap-1 px-2 py-1 font-mono text-xs border border-cyber-orange/50 text-cyber-orange rounded"
                      >
                        <Hourglass className="w-3 h-3" />
                        等待依赖
                      </span>
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
          <EmptyState icon={Activity} message="暂无任务" className="h-32" />
        )}
      </div>

      {/* issue #49：任务依赖关系面板 */}
      {selectedTask && (
        <div className="mt-4 p-4 border border-moss-cyan/30 rounded bg-moss-cyan/5">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-moss-cyan" />
            <h4 className="font-mono text-sm text-moss-white">依赖关系 · {selectedTask.name}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 前置依赖：当前任务依赖谁 */}
            <div>
              <div className="text-xs text-moss-white/50 mb-2">被依赖（前置依赖）</div>
              {selectedTask.dependencies.length === 0 ? (
                <div className="text-xs text-moss-white/30">无前置依赖</div>
              ) : (
                <ul className="space-y-1">
                  {selectedTask.dependencies.map((depId) => {
                    const dep = taskById(depId);
                    return (
                      <li
                        key={depId}
                        className="flex items-center justify-between gap-2 text-xs px-2 py-1 border border-moss-white/10 rounded"
                      >
                        <span className="truncate text-moss-white/80">{dep ? dep.name : `未找到 (${depId})`}</span>
                        <span
                          className={`flex-shrink-0 px-1.5 rounded ${
                            !dep || dep.status === 'completed'
                              ? 'text-cyber-green bg-cyber-green/10'
                              : 'text-cyber-orange bg-cyber-orange/10'
                          }`}
                        >
                          {dep ? dep.status : '缺失'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 阻塞链：谁依赖当前任务 */}
            <div>
              <div className="text-xs text-moss-white/50 mb-2">被阻塞（后续依赖）</div>
              {(() => {
                const dependents = tasks.filter((t) => t.dependencies.includes(selectedTask.id));
                if (dependents.length === 0) return <div className="text-xs text-moss-white/30">无后续依赖</div>;
                return (
                  <ul className="space-y-1">
                    {dependents.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-2 text-xs px-2 py-1 border border-moss-white/10 rounded"
                      >
                        <span className="truncate text-moss-white/80">{t.name}</span>
                        <span className="flex-shrink-0 text-moss-white/40">{t.status}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
});
