/**
 * issue #52：国际化字典。
 * 采用扁平的 "域.键" 结构，便于类型化与查询。
 */
export const translations = {
  'zh-CN': {
    'app.title': 'QuantumOS',
    // 设置面板
    'settings.title': '系统设置',
    'settings.appearance': '外观设置',
    'settings.themeMode': '主题模式',
    'settings.theme.dark': '深色',
    'settings.theme.light': '浅色',
    'settings.animations': '动画效果',
    'settings.notificationsTitle': '通知设置',
    'settings.enableNotifications': '启用通知',
    'settings.sound': '声音提示',
    'settings.system': '系统设置',
    'settings.language': '界面语言',
    'settings.autoUpdate': '自动更新',
    'settings.dataTitle': '数据管理',
    'settings.dataDesc': '清除所有本地存储的数据，包括任务、决策、日志、警报和设置。此操作不可撤销。',
    'settings.clearData': '清除所有数据',
    'settings.confirmClear': '确认清除所有本地数据？此操作不可撤销。',
    'settings.footer': '量子计算机操作系统 · 550系列',
    // 锁屏
    'lock.placeholder': '输入解锁密码...',
    'lock.retry': '认证失败 - 重试',
    'lock.authFailed': '认证失败: 无效的授权凭证',
    'lock.hint': '按下 Enter 或点击盾牌图标解锁',
    'lock.subtitle': '550W 量子计算机',
    // 开始菜单
    'startMenu.title': '应用',
    // 任务栏 / 桌面
    'taskbar.cpu': 'CPU',
    'taskbar.mem': 'MEM',
    'taskbar.net': 'NET',
    'taskbar.running': '任务',
  },
  'en-US': {
    'app.title': 'QuantumOS',
    // Settings panel
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.themeMode': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.animations': 'Animations',
    'settings.notificationsTitle': 'Notifications',
    'settings.enableNotifications': 'Enable notifications',
    'settings.sound': 'Sound alert',
    'settings.system': 'System',
    'settings.language': 'Language',
    'settings.autoUpdate': 'Auto update',
    'settings.dataTitle': 'Data',
    'settings.dataDesc':
      'Clear all locally stored data, including tasks, decisions, logs, alerts and settings. This cannot be undone.',
    'settings.clearData': 'Clear all data',
    'settings.confirmClear': 'Confirm clearing all local data? This cannot be undone.',
    'settings.footer': 'Quantum Computer OS · Series 550',
    // Lock screen
    'lock.placeholder': 'Enter unlock password...',
    'lock.retry': 'Auth failed - retry',
    'lock.authFailed': 'Authentication failed: invalid credential',
    'lock.hint': 'Press Enter or click the shield icon to unlock',
    'lock.subtitle': '550W Quantum Computer',
    // Start menu
    'startMenu.title': 'Apps',
    // Taskbar / Desktop
    'taskbar.cpu': 'CPU',
    'taskbar.mem': 'MEM',
    'taskbar.net': 'NET',
    'taskbar.running': 'Tasks',
  },
} as const;

export type SupportedLanguage = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['zh-CN'];