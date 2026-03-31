'use client';

import React, { useEffect, useState } from 'react';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkActivity: number;
  processCount: number;
  uptime: number;
  temperature: number;
}

export const SystemStatus: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    networkActivity: 0,
    processCount: 0,
    uptime: 0,
    temperature: 0
  });

  useEffect(() => {
    // 模拟系统指标
    const updateMetrics = () => {
      setMetrics(prev => ({
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkActivity: Math.min(100, Math.max(0, prev.networkActivity + (Math.random() - 0.5) * 15)),
        processCount: Math.floor(Math.max(10, prev.processCount + (Math.random() - 0.5) * 2)),
        uptime: prev.uptime + 1,
        temperature: Math.min(80, Math.max(40, prev.temperature + (Math.random() - 0.5) * 2))
      }));
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  // 格式化 uptime
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取状态颜色
  const getStatusColor = (value: number, threshold: number): string => {
    if (value > threshold * 0.8) return 'text-red-400';
    if (value > threshold * 0.6) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="absolute right-0 top-0 w-1/3 h-full bg-gray-900/80 backdrop-blur-sm border-l border-teal-500/30 p-4 z-10 overflow-y-auto">
      <h2 className="text-xl font-bold text-teal-400 mb-6 flex items-center">
        <span className="mr-2">⚙️</span>
        系统运行状态
      </h2>

      {/* 系统概览 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-500/20">
          <div className="text-sm text-gray-400 mb-1">运行时间</div>
          <div className="text-xl font-mono text-teal-400">{formatUptime(metrics.uptime)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-500/20">
          <div className="text-sm text-gray-400 mb-1">进程数</div>
          <div className="text-xl font-mono text-teal-400">{metrics.processCount}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-500/20">
          <div className="text-sm text-gray-400 mb-1">CPU温度</div>
          <div className={`text-xl font-mono ${getStatusColor(metrics.temperature, 80)}`}>
            {metrics.temperature.toFixed(1)}°C
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-500/20">
          <div className="text-sm text-gray-400 mb-1">网络活动</div>
          <div className={`text-xl font-mono ${getStatusColor(metrics.networkActivity, 100)}`}>
            {metrics.networkActivity.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* CPU 使用率 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-500/20 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-400">CPU 使用率</div>
          <div className={`font-mono ${getStatusColor(metrics.cpuUsage, 100)}`}>
            {metrics.cpuUsage.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ${metrics.cpuUsage > 80 ? 'bg-red-500' : metrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-teal-500'}`}
            style={{ width: `${metrics.cpuUsage}%` }}
          />
        </div>
      </div>

      {/* 内存使用率 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-500/20 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-400">内存使用率</div>
          <div className={`font-mono ${getStatusColor(metrics.memoryUsage, 100)}`}>
            {metrics.memoryUsage.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ${metrics.memoryUsage > 80 ? 'bg-red-500' : metrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-teal-500'}`}
            style={{ width: `${metrics.memoryUsage}%` }}
          />
        </div>
      </div>

      {/* 网络活动图表 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-500/20 mb-4">
        <div className="text-sm text-gray-400 mb-4">网络活动</div>
        <div className="h-32 w-full flex items-end justify-between px-2">
          {Array.from({ length: 20 }, (_, i) => (
            <div 
              key={i}
              className="w-2 bg-teal-500/60 transition-all duration-300"
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                opacity: 0.3 + (i % 5 === 0 ? 0.7 : 0)
              }}
            />
          ))}
        </div>
      </div>

      {/* 系统进程 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-500/20">
        <div className="text-sm text-gray-400 mb-3">系统进程</div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {Array.from({ length: 8 }, (_, i) => ({
            id: 1000 + i,
            name: ['moss-server', 'tokenizer', 'encoder', 'decoder', 'api-server', 'logger', 'monitor', 'backup'][i],
            cpu: Math.random() * 20,
            memory: Math.random() * 10
          })).map(process => (
            <div key={process.id} className="flex justify-between items-center text-xs">
              <div className="font-mono text-teal-300">{process.name}</div>
              <div className="flex space-x-4">
                <div className="text-gray-400">CPU: {process.cpu.toFixed(1)}%</div>
                <div className="text-gray-400">MEM: {process.memory.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};