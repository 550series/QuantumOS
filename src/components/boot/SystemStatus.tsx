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
    if (value > threshold * 0.8) return 'text-red-300/60';
    if (value > threshold * 0.6) return 'text-yellow-300/60';
    return 'text-green-300/60';
  };

  return (
    <div className="absolute right-0 top-0 w-1/2 h-full bg-gray-900/20 backdrop-blur-sm border-l border-teal-500/10 p-4 z-0 overflow-y-auto">
      <h2 className="text-lg font-bold text-teal-400/50 mb-4 flex items-center">
        <span className="mr-2">⚙️</span>
        系统运行状态
      </h2>

      {/* 系统概览 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/20 rounded-lg p-3 border border-teal-500/10">
          <div className="text-xs text-gray-400/60 mb-1">运行时间</div>
          <div className="text-lg font-mono text-teal-400/60">{formatUptime(metrics.uptime)}</div>
        </div>
        <div className="bg-gray-800/20 rounded-lg p-3 border border-teal-500/10">
          <div className="text-xs text-gray-400/60 mb-1">进程数</div>
          <div className="text-lg font-mono text-teal-400/60">{metrics.processCount}</div>
        </div>
        <div className="bg-gray-800/20 rounded-lg p-3 border border-teal-500/10">
          <div className="text-xs text-gray-400/60 mb-1">CPU温度</div>
          <div className={`text-lg font-mono ${getStatusColor(metrics.temperature, 80)}`}>
            {metrics.temperature.toFixed(1)}°C
          </div>
        </div>
        <div className="bg-gray-800/20 rounded-lg p-3 border border-teal-500/10">
          <div className="text-xs text-gray-400/60 mb-1">网络活动</div>
          <div className={`text-lg font-mono ${getStatusColor(metrics.networkActivity, 100)}`}>
            {metrics.networkActivity.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* CPU 使用率 */}
      <div className="bg-gray-800/20 rounded-lg p-3 border border-teal-500/10 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-400/60">CPU 使用率</div>
          <div className={`font-mono ${getStatusColor(metrics.cpuUsage, 100)}`}>
            {metrics.cpuUsage.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-gray-700/30 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${metrics.cpuUsage > 80 ? 'bg-red-500/40' : metrics.cpuUsage > 60 ? 'bg-yellow-500/40' : 'bg-teal-500/40'}`}
            style={{ width: `${metrics.cpuUsage}%` }}
          />
        </div>
      </div>

      {/* 内存使用率 */}
      <div className="bg-gray-800/20 rounded-lg p-3 border border-teal-500/10 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-400/60">内存使用率</div>
          <div className={`font-mono ${getStatusColor(metrics.memoryUsage, 100)}`}>
            {metrics.memoryUsage.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-gray-700/30 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${metrics.memoryUsage > 80 ? 'bg-red-500/40' : metrics.memoryUsage > 60 ? 'bg-yellow-500/40' : 'bg-teal-500/40'}`}
            style={{ width: `${metrics.memoryUsage}%` }}
          />
        </div>
      </div>

      {/* 网络活动图表 */}
      <div className="bg-gray-800/20 rounded-lg p-3 border border-teal-500/10 mb-3">
        <div className="text-xs text-gray-400/60 mb-3">网络活动</div>
        <div className="h-24 w-full flex items-end justify-between px-2">
          {Array.from({ length: 20 }, (_, i) => (
            <div 
              key={i}
              className="w-2 bg-teal-500/30 transition-all duration-300"
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                opacity: 0.2 + (i % 5 === 0 ? 0.4 : 0)
              }}
            />
          ))}
        </div>
      </div>

      {/* 系统进程 */}
      <div className="bg-gray-800/20 rounded-lg p-3 border border-teal-500/10">
        <div className="text-xs text-gray-400/60 mb-2">系统进程</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {Array.from({ length: 6 }, (_, i) => ({
            id: 1000 + i,
            name: ['moss-server', 'tokenizer', 'encoder', 'decoder', 'api-server', 'logger'][i],
            cpu: Math.random() * 20,
            memory: Math.random() * 10
          })).map(process => (
            <div key={process.id} className="flex justify-between items-center text-xs">
              <div className="font-mono text-teal-300/50">{process.name}</div>
              <div className="flex space-x-3">
                <div className="text-gray-400/50">CPU: {process.cpu.toFixed(1)}%</div>
                <div className="text-gray-400/50">MEM: {process.memory.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};