'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, PlusCircle, Terminal, Lock, Settings, FolderOpen, type LucideIcon } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRefresh: () => void;
  onNewTask: () => void;
  onOpenTerminal: () => void;
  onOpenSettings: () => void;
  onOpenFileExplorer: () => void;
  onLock: () => void;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface MenuSeparator {
  separator: true;
}

type MenuEntry = MenuItem | MenuSeparator;

// 菜单预估尺寸，用于边界检测时计算（issue #31：避免渲染期读 window）
const MENU_WIDTH = 220;
const MENU_HEIGHT = 320;

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onRefresh,
  onNewTask,
  onOpenTerminal,
  onOpenSettings,
  onOpenFileExplorer,
  onLock,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  // 将 window 尺寸读取移入 state + effect，避免 SSR 期直接读 window 报错，
  // 同时窗口尺寸变化时也能重新计算位置。
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const measure = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 在 viewport 已测量后再做边界修正，避免首帧位置越界
  const adjustedX = viewport.width > 0 ? Math.min(x, viewport.width - MENU_WIDTH) : x;
  const adjustedY = viewport.height > 0 ? Math.min(y, viewport.height - MENU_HEIGHT) : y;

  const menuItems: MenuEntry[] = [
    { icon: RefreshCw, label: '刷新桌面', onClick: onRefresh },
    { icon: PlusCircle, label: '新建任务', onClick: onNewTask },
    { icon: Terminal, label: '打开终端', onClick: onOpenTerminal },
    { icon: FolderOpen, label: '文件浏览器', onClick: onOpenFileExplorer },
    { icon: Settings, label: '系统设置', onClick: onOpenSettings },
    { separator: true },
    { icon: Lock, label: '锁定屏幕', onClick: onLock, danger: true },
  ];

  const isMenuItem = (entry: MenuEntry): entry is MenuItem => !('separator' in entry);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[9999] glass-panel py-1 min-w-[200px]"
        style={{ left: adjustedX, top: adjustedY }}
      >
        {menuItems.map((entry, i) => {
          if (!isMenuItem(entry)) {
            return <div key={i} className="border-t border-moss-cyan/20 my-1" />;
          }

          const IconComponent = entry.icon;
          return (
            <button
              key={i}
              onClick={() => {
                entry.onClick();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 font-mono text-xs transition-all ${
                entry.danger
                  ? 'text-cyber-red hover:bg-cyber-red/10'
                  : 'text-moss-white hover:bg-moss-cyan/10'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{entry.label}</span>
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};