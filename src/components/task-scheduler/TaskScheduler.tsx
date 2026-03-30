'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores';
import {
  getTasks,
  createTask,
  deleteTask,
  startTask,
  cancelTask,
  initDefaultTasks,
  getTaskStats,
} from '@/services/taskService';
import { Panel, Button } from '@/components/ui';
import type { Task } from '@/types';
import {
  Play,
  Square,
  Trash2,
  Plus,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

// 状态颜色映射
const statusColors = {
  pending: 'text-moss-white/60',
  running: 'text-cyber-green',
  completed: 'text-moss-cyan',
  failed: 'text-cyber-red',
  cancelled: 'text-moss-white/40',
};

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  running: <Activity className="w-4 h-4 animate-pulse" />,
  completed: <CheckCircle className="w-4 h-4" />,
  failed: <XCircle className="w-4 h-4" />,
  cancelled: <AlertTriangle className="w-4 h-4" />,
};

const priorityColors = {
  low: 'text-moss-white/60',
  normal: 'text-moss-white/80',
  high: 'text-cyber-orange',
  critical: 'text-cyber-red',
};

export const TaskScheduler: React.FC = () => {
  const {
    tasks,
    stats,
    selectedTaskId,
    setTasks,
    selectTask,
    updateStats,
  } = useTaskStore();

  const [loading, setLoading] = useState(false);

  // 初始化任务
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initDefaultTasks();
      const tasks = await getTasks();
      setTasks(tasks);
      const stats = await getTaskStats();
      updateStats();
      setLoading(false);
    };
    init();
  }, [setTasks, updateStats]);

  // 定期更新统计数据
  useEffect(() => {
    const interval = setInterval(async () => {
      const tasks = await getTasks();
      setTasks(tasks);
      updateStats();
    }, 2000);

    return () => clearInterval(interval);
  }, [setTasks, updateStats]);

  // 创建新任务
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
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
    updateStats();
  };

  // 启动任务
  const handleStartTask = async (id: string) => {
    await startTask(id);
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
    updateStats();
  };

  // 取消任务
  const handleCancelTask = async (id: string) => {
    await cancelTask(id);
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
    updateStats();
  };

  // 删除任务
  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
    selectTask(null);
    updateStats();
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
          tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                border rounded p-3 cursor-pointer transition-all
                ${
                  selectedTaskId === task.id
                    ? 'border-moss-cyan bg-moss-cyan/10 shadow-neon'
                    : 'border-moss-cyan/20 hover:border-moss-cyan/40'
                }
              `}
              onClick={() => selectTask(task.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={statusColors[task.status]}>
                    {statusIcons[task.status]}
                  </div>
                  <span className="font-medium text-moss-white">{task.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
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
            </motion.div>
          ))
        )}

        {tasks.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-32 text-moss-white/40">
            <Activity className="w-12 h-12 mb-2" />
            <p>暂无任务</p>
          </div>
        )}
      </div>
    </Panel>
  );
};
