'use client';

import React, { useCallback } from 'react';

import { Settings, Monitor, Bell, Volume2, Globe, RefreshCw, Trash2, Database } from 'lucide-react';

import { Button } from '@/components/ui';
import { useTranslations } from '@/lib/i18n';
import { useSystemStore } from '@/stores';

export const SettingsPanel: React.FC = () => {
  const { config, updateConfig } = useSystemStore();
  const { t } = useTranslations();

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
    if (window.confirm(t('settings.confirmClear'))) {
      indexedDB.deleteDatabase('QuantumOS');
      window.location.reload();
    }
  }, [t]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-moss-cyan" />
        <h2 className="text-xl font-mono text-moss-cyan">{t('settings.title')}</h2>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-moss-cyan/30 rounded">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="w-4 h-4 text-moss-cyan" />
            <h3 className="font-mono text-sm text-moss-white">{t('settings.appearance')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-moss-white/60">{t('settings.themeMode')}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                    config.theme === 'dark'
                      ? 'bg-moss-cyan/20 border-moss-cyan text-moss-cyan'
                      : 'border-moss-white/20 text-moss-white/60 hover:border-moss-cyan/30'
                  }`}
                >
                  {t('settings.theme.dark')}
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                    config.theme === 'light'
                      ? 'bg-moss-cyan/20 border-moss-cyan text-moss-cyan'
                      : 'border-moss-white/20 text-moss-white/60 hover:border-moss-cyan/30'
                  }`}
                >
                  {t('settings.theme.light')}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-moss-white/60">{t('settings.animations')}</span>
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
            <h3 className="font-mono text-sm text-moss-white">{t('settings.notificationsTitle')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-moss-white/60">{t('settings.enableNotifications')}</span>
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
                <span className="text-xs text-moss-white/60">{t('settings.sound')}</span>
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
            <h3 className="font-mono text-sm text-moss-white">{t('settings.system')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-moss-white/60">{t('settings.language')}</span>
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
                <span className="text-xs text-moss-white/60">{t('settings.autoUpdate')}</span>
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
            <h3 className="font-mono text-sm text-cyber-orange">{t('settings.dataTitle')}</h3>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-moss-white/50">
              {t('settings.dataDesc')}
            </p>
            <Button variant="danger" size="sm" onClick={handleClearData}>
              <Trash2 className="w-3 h-3 mr-1" />
              {t('settings.clearData')}
            </Button>
          </div>
        </div>

        <div className="p-4 border border-moss-cyan/30 rounded text-center">
          <p className="font-mono text-xs text-moss-cyan/50">MOSS OS v1.0 | QuantumOS</p>
          <p className="font-mono text-xs text-moss-white/30 mt-1">
            {t('settings.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};