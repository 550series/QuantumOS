'use client';

import React, { useCallback } from 'react';
import { Settings, Monitor, Bell, Volume2, Globe, RefreshCw, Trash2, Database } from 'lucide-react';
import { useSystemStore } from '@/stores';
import { Button } from '@/components/ui';

export const SettingsPanel: React.FC = () => {
  const { config, updateConfig } = useSystemStore();

  const handleThemeChange = useCallback(
    (theme: 'dark' | 'light') => {
      updateConfig({ theme });
    },
    [updateConfig]
  );

  const handleToggle = useCallback(
    (key: 'animationsEnabled' | 'soundEnabled' | 'notificationsEnabled' | 'autoUpdate') => {
      updateConfig({ [key]: !config[key] });
    },
    [config, updateConfig]
  );

  const handleClearData = useCallback(() => {
    if (window.confirm('确认清除所有本地数据？此操作不可撤销。')) {
      indexedDB.deleteDatabase('QuantumOS');
      window.location.reload();
    }
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-moss-cyan" />
        <h2 className="text-xl font-mono text-moss-cyan">系统设置</h2>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-moss-cyan/30 rounded">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="w-4 h-4 text-moss-cyan" />
            <h3 className="font-mono text-sm text-moss-white">外观设置</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-moss-white/60">主题模式</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                    config.theme === 'dark'
                      ? 'bg-moss-cyan/20 border-moss-cyan text-moss-cyan'
                      : 'border-moss-white/20 text-moss-white/60 hover:border-moss-cyan/30'
                  }`}
                >
                  深色
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                    config.theme === 'light'
                      ? 'bg-moss-cyan/20 border-moss-cyan text-moss-cyan'
                      : 'border-moss-white/20 text-moss-white/60 hover:border-moss-cyan/30'
                  }`}
                >
                  浅色
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-moss-white/60">动画效果</span>
              </div>
              <button
                onClick={() => handleToggle('animationsEnabled')}
                className={`relative w-10 h-5 rounded-full transition-all ${
                  config.animationsEnabled ? 'bg-moss-cyan' : 'bg-dark-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                    config.animationsEnabled ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border border-moss-cyan/30 rounded">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-moss-cyan" />
            <h3 className="font-mono text-sm text-moss-white">通知设置</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-moss-white/60">启用通知</span>
              </div>
              <button
                onClick={() => handleToggle('notificationsEnabled')}
                className={`relative w-10 h-5 rounded-full transition-all ${
                  config.notificationsEnabled ? 'bg-moss-cyan' : 'bg-dark-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                    config.notificationsEnabled ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-3 h-3 text-moss-white/60" />
                <span className="text-xs text-moss-white/60">声音提示</span>
              </div>
              <button
                onClick={() => handleToggle('soundEnabled')}
                className={`relative w-10 h-5 rounded-full transition-all ${
                  config.soundEnabled ? 'bg-moss-cyan' : 'bg-dark-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                    config.soundEnabled ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border border-moss-cyan/30 rounded">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-moss-cyan" />
            <h3 className="font-mono text-sm text-moss-white">系统设置</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-moss-white/60">界面语言</span>
              <select
                value={config.language}
                onChange={(e) => updateConfig({ language: e.target.value })}
                className="bg-dark-900 border border-moss-cyan/30 text-moss-white text-xs px-2 py-1 rounded"
              >
                <option value="zh-CN">中文简体</option>
                <option value="en-US">English</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-moss-white/60" />
                <span className="text-xs text-moss-white/60">自动更新</span>
              </div>
              <button
                onClick={() => handleToggle('autoUpdate')}
                className={`relative w-10 h-5 rounded-full transition-all ${
                  config.autoUpdate ? 'bg-moss-cyan' : 'bg-dark-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                    config.autoUpdate ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border border-moss-cyan/30 rounded">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-cyber-orange" />
            <h3 className="font-mono text-sm text-cyber-orange">数据管理</h3>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-moss-white/50">
              清除所有本地存储的数据，包括任务、决策、日志、警报和设置。此操作不可撤销。
            </p>
            <Button variant="danger" size="sm" onClick={handleClearData}>
              <Trash2 className="w-3 h-3 mr-1" />
              清除所有数据
            </Button>
          </div>
        </div>

        <div className="p-4 border border-moss-cyan/30 rounded text-center">
          <p className="font-mono text-xs text-moss-cyan/50">MOSS OS v1.0 | QuantumOS</p>
          <p className="font-mono text-xs text-moss-white/30 mt-1">
            量子计算机操作系统 · 550系列
          </p>
        </div>
      </div>
    </div>
  );
};