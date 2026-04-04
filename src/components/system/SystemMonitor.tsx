'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Panel } from '@/components/ui/Panel/Panel';
import { Button } from '@/components/ui/Button/Button';
import { useSystemStore } from '@/stores';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  TrendingUp,
  Zap,
  Play,
  Pause,
} from 'lucide-react';

// 系统状态历史数据接口
interface SystemHistoryData {
  timestamp: number;
  cpu: number;
  memory: number;
  networkDownload: number;
  networkUpload: number;
}

export const SystemMonitor: React.FC = () => {
  const { status, updateStatus } = useSystemStore();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [historyData, setHistoryData] = useState<SystemHistoryData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成模拟系统数据
  useEffect(() => {
    if (!isMonitoring) return;

    const generateSystemData = () => {
      // 生成有波动的CPU数据
      const baseCpu = 30 + Math.sin(Date.now() / 10000) * 20;
      const cpu = Math.max(0, Math.min(100, baseCpu + (Math.random() * 10 - 5)));

      // 生成有波动的内存数据
      const baseMemory = 40 + Math.cos(Date.now() / 15000) * 15;
      const memory = Math.max(0, Math.min(100, baseMemory + (Math.random() * 8 - 4)));

      // 生成网络数据
      const networkDownload = 100 + Math.random() * 100;
      const networkUpload = 50 + Math.random() * 50;

      // 更新系统状态
      updateStatus({
        cpu,
        memory: {
          ...status.memory,
          used: (memory / 100) * status.memory.total,
          free: status.memory.total - (memory / 100) * status.memory.total,
          percentage: memory,
        },
        network: {
          upload: networkUpload,
          download: networkDownload,
        },
      });

      // 更新历史数据
      setHistoryData(prev => {
        const newData = [
          {
            timestamp: Date.now(),
            cpu,
            memory,
            networkDownload,
            networkUpload,
          },
          ...prev,
        ];
        // 只保留最近60秒的数据
        return newData.filter(item => Date.now() - item.timestamp < 60000);
      });
    };

    generateSystemData();
    const interval = setInterval(generateSystemData, 1000);
    return () => clearInterval(interval);
  }, [isMonitoring, status, updateStatus]);

  // 绘制系统状态图表
  useEffect(() => {
    if (!canvasRef.current || historyData.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 绘制CPU使用率
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    historyData.forEach((data, index) => {
      const x = (index / (historyData.length - 1)) * canvas.width;
      const y = canvas.height - (data.cpu / 100) * canvas.height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 绘制内存使用率
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    historyData.forEach((data, index) => {
      const x = (index / (historyData.length - 1)) * canvas.width;
      const y = canvas.height - (data.memory / 100) * canvas.height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 绘制图例
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(10, 10, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText('CPU', 25, 20);

    ctx.fillStyle = '#00ff88';
    ctx.fillRect(10, 25, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('内存', 25, 35);

  }, [historyData]);

  // 启动/停止监控
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* 监控控制 */}
      <Panel title="系统监控" glow glowColor="cyan">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-moss-cyan" />
            <span className="text-sm font-medium text-moss-white">
              实时监控
            </span>
          </div>
          <Button
            variant={isMonitoring ? 'danger' : 'primary'}
            onClick={toggleMonitoring}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                暂停
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                启动
              </>
            )}
          </Button>
        </div>

        {/* 系统状态卡片 */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {/* CPU状态 */}
          <div className="p-3 border border-moss-cyan/20 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-moss-cyan" />
                <span className="text-xs font-mono text-moss-white">CPU</span>
              </div>
              <span className={`text-xs font-mono ${status.cpu > 80 ? 'text-cyber-red' : status.cpu > 60 ? 'text-cyber-orange' : 'text-cyber-green'}`}>
                {Math.round(status.cpu)}%
              </span>
            </div>
            <div className="w-full h-1 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(status.cpu, 100)}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full ${status.cpu > 80 ? 'bg-cyber-red' : status.cpu > 60 ? 'bg-cyber-orange' : 'bg-gradient-to-r from-moss-cyan to-cyber-green'}`}
              />
            </div>
          </div>

          {/* 内存状态 */}
          <div className="p-3 border border-moss-cyan/20 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-moss-cyan" />
                <span className="text-xs font-mono text-moss-white">内存</span>
              </div>
              <span className={`text-xs font-mono ${status.memory.percentage > 80 ? 'text-cyber-red' : status.memory.percentage > 60 ? 'text-cyber-orange' : 'text-cyber-green'}`}>
                {Math.round(status.memory.percentage)}%
              </span>
            </div>
            <div className="w-full h-1 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(status.memory.percentage, 100)}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full ${status.memory.percentage > 80 ? 'bg-cyber-red' : status.memory.percentage > 60 ? 'bg-cyber-orange' : 'bg-gradient-to-r from-moss-cyan to-cyber-green'}`}
              />
            </div>
          </div>

          {/* 网络状态 */}
          <div className="p-3 border border-moss-cyan/20 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-moss-cyan" />
                <span className="text-xs font-mono text-moss-white">网络</span>
              </div>
              <span className="text-xs font-mono text-moss-cyan">
                {Math.round(status.network.download)}KB/s
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-cyber-green" />
                <span className="text-moss-white/60">下载:</span>
                <span className="text-cyber-green">
                  {Math.round(status.network.download)}KB/s
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-cyber-orange" />
                <span className="text-moss-white/60">上传:</span>
                <span className="text-cyber-orange">
                  {Math.round(status.network.upload)}KB/s
                </span>
              </div>
            </div>
          </div>

          {/* 系统运行时间 */}
          <div className="p-3 border border-moss-cyan/20 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-moss-cyan" />
                <span className="text-xs font-mono text-moss-white">运行时间</span>
              </div>
              <span className="text-xs font-mono text-moss-cyan">
                {Math.floor(status.uptime / 3600)}h {Math.floor((status.uptime % 3600) / 60)}m
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Zap className="w-3 h-3 text-moss-white/60" />
              <span className="text-moss-white/60">系统状态:</span>
              <span className="text-cyber-green">正常</span>
            </div>
          </div>
        </div>

        {/* 系统状态图表 */}
        <div className="border border-moss-cyan/20 rounded p-3">
          <h3 className="text-xs font-mono text-moss-cyan mb-3">系统状态趋势</h3>
          <div className="relative">
            <canvas ref={canvasRef} className="w-full h-48" />
          </div>
        </div>
      </Panel>

      {/* 系统详情 */}
      <Panel title="系统详情" className="flex-1">
        <div className="grid grid-cols-2 gap-4">
          {/* 硬件信息 */}
          <div>
            <h3 className="text-xs font-mono text-moss-cyan mb-3">硬件信息</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-moss-white/60">CPU型号:</span>
                <span className="text-moss-white">Intel Core i7-12700K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-moss-white/60">内存容量:</span>
                <span className="text-moss-white">{status.memory.total}MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-moss-white/60">存储容量:</span>
                <span className="text-moss-white">{status.disk.total}GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-moss-white/60">网络适配器:</span>
                <span className="text-moss-white">Intel Ethernet Connection I225-V</span>
              </div>
            </div>
          </div>

          {/* 系统信息 */}
          <div>
            <h3 className="text-xs font-mono text-moss-cyan mb-3">系统信息</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-moss-white/60">操作系统:</span>
                <span className="text-moss-white">MOSS OS v1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-moss-white/60">内核版本:</span>
                <span className="text-moss-white">5.15.0-52-generic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-moss-white/60">MOSS版本:</span>
                <span className="text-moss-white">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-moss-white/60">启动时间:</span>
                <span className="text-moss-white">
                  {new Date(Date.now() - status.uptime * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};
