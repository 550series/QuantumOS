'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import { useSystemStore } from '@/stores';

import { appConfig, type AppType, type AppConfigEntry } from './appConfig';

interface Position { x: number; y: number; }
interface Size { width: number; height: number; }

// 拖拽：originPos 为按下时的窗口位置（不可变），按下时的鼠标坐标 startX/Y 用于计算位移。
interface DragState {
  windowId: string;
  pos: Position; // 实时位置（用于渲染）
}
interface ResizeState {
  windowId: string;
  size: Size; // 实时尺寸（用于渲染）
}
interface DragRef {
  windowId: string;
  originPos: Position;
  startX: number;
  startY: number;
  livePos: Position; // mouseup 时一次性 commit 的最终位置
}
interface ResizeRef {
  windowId: string;
  originSize: Size;
  startX: number;
  startY: number;
  liveSize: Size; // mouseup 时一次性 commit 的最终尺寸
}

interface WindowFrameProps {
  win: import('@/types').Window;
  config: AppConfigEntry;
  isActive: boolean;
  livePosition?: Position | null;
  liveSize?: Size | null;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onClose: (id: string) => void;
  onDragStart: (id: string, startPos: Position, e: React.MouseEvent) => void;
  onResizeStart: (id: string, startSize: Size, e: React.MouseEvent) => void;
}

// 独立 memo 化的窗口帧：拖拽期间仅被拖拽窗口的 livePosition/liveSize 变化，
// 其余窗口 props 引用稳定，不会重渲染（避免 FileExplorer 等重型业务组件在拖拽时卡顿）。
const WindowFrame = memo(function WindowFrame({
  win,
  config,
  isActive,
  livePosition,
  liveSize,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  onDragStart,
  onResizeStart,
}: WindowFrameProps) {
  const AppComponent = config.component;

  const position = livePosition ?? win.position;
  const size = liveSize ?? win.size;

  const windowStyle = {
    left: win.isMaximized ? 0 : position.x,
    top: win.isMaximized ? 0 : position.y,
    width: win.isMaximized ? (typeof window !== 'undefined' ? window.innerWidth : 1000) : size.width,
    height: win.isMaximized ? (typeof window !== 'undefined' ? window.innerHeight - 56 : 700) : size.height,
    zIndex: win.zIndex,
  };

  return (
    <motion.div
      key={win.id}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`absolute glass-panel ${isActive ? 'ring-2 ring-moss-cyan shadow-neon-strong' : ''}`}
      style={windowStyle}
      onClick={() => onFocus(win.id)}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-moss-cyan/20 cursor-move"
        onMouseDown={(e) => onDragStart(win.id, position, e)}
      >
        <div className="flex items-center gap-2">
          <div className="text-moss-cyan">{config.icon}</div>
          <span className="font-mono text-sm text-moss-white">{win.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1 hover:bg-moss-cyan/10 rounded"
            onClick={() => onMinimize(win.id)}
          >
            <div className="w-3 h-0.5 bg-moss-white/60"></div>
          </button>
          <button
            className="p-1 hover:bg-moss-cyan/10 rounded"
            onClick={() => onMaximize(win.id)}
          >
            <div className="w-3 h-3 border border-moss-white/60"></div>
          </button>
          <button
            className="p-1 hover:bg-cyber-red/10 rounded"
            onClick={() => onClose(win.id)}
          >
            <span className="text-cyber-red text-xs">&times;</span>
          </button>
        </div>
      </div>

      <div className="p-2 h-[calc(100%-40px)] overflow-auto">
        <AppComponent />
      </div>

      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-moss-cyan/30 cursor-se-resize"
        onMouseDown={(e) => onResizeStart(win.id, size, e)}
      />
    </motion.div>
  );
});

export const WindowManager: React.FC = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow, maximizeWindow, closeWindow, updateWindowPosition, updateWindowSize } =
    useSystemStore();

  // 拖拽/缩放期间仅更新本地状态，mouseup 时一次性 commit 到 store，
  // 避免 mousemove 每帧写 store 触发所有订阅者（Taskbar/SystemMonitor 等）重渲染。
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const dragRef = useRef<DragRef | null>(null);
  const resizeRef = useRef<ResizeRef | null>(null);

  const handleDragStart = useCallback((windowId: string, originPos: Position, e: React.MouseEvent) => {
    e.stopPropagation();
    const livePos = { ...originPos };
    dragRef.current = {
      windowId,
      originPos: { ...originPos },
      startX: e.clientX,
      startY: e.clientY,
      livePos,
    };
    setDragState({ windowId, pos: livePos });
    focusWindow(windowId);
  }, [focusWindow]);

  const handleResizeStart = useCallback((windowId: string, originSize: Size, e: React.MouseEvent) => {
    e.stopPropagation();
    const liveSize = { ...originSize };
    resizeRef.current = {
      windowId,
      originSize: { ...originSize },
      startX: e.clientX,
      startY: e.clientY,
      liveSize,
    };
    setResizeState({ windowId, size: liveSize });
    focusWindow(windowId);
  }, [focusWindow]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const d = dragRef.current;
        // 基于 originPos + 总位移计算，避免增量累积造成漂移
        const pos = {
          x: d.originPos.x + (e.clientX - d.startX),
          y: d.originPos.y + (e.clientY - d.startY),
        };
        d.livePos = pos;
        setDragState({ windowId: d.windowId, pos });
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        const size = {
          width: Math.max(300, r.originSize.width + (e.clientX - r.startX)),
          height: Math.max(200, r.originSize.height + (e.clientY - r.startY)),
        };
        r.liveSize = size;
        setResizeState({ windowId: r.windowId, size });
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        // 一次性 commit 拖拽实时位置
        updateWindowPosition(dragRef.current.windowId, dragRef.current.livePos);
        dragRef.current = null;
        setDragState(null);
      }
      if (resizeRef.current) {
        // 一次性 commit 缩放实时尺寸
        updateWindowSize(resizeRef.current.windowId, resizeRef.current.liveSize);
        resizeRef.current = null;
        setResizeState(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateWindowPosition, updateWindowSize]);

  return (
    <>
      {windows.map((win) => {
        const config = appConfig[win.type as AppType];
        if (!config) return null;
        if (win.isMinimized) return null;

        const isActive = activeWindowId === win.id;
        const livePosition = dragState?.windowId === win.id ? dragState.pos : null;
        const liveSize = resizeState?.windowId === win.id ? resizeState.size : null;

        return (
          <WindowFrame
            key={win.id}
            win={win}
            config={config}
            isActive={isActive}
            livePosition={livePosition}
            liveSize={liveSize}
            onFocus={focusWindow}
            onMinimize={minimizeWindow}
            onMaximize={maximizeWindow}
            onClose={closeWindow}
            onDragStart={handleDragStart}
            onResizeStart={handleResizeStart}
          />
        );
      })}
    </>
  );
};
