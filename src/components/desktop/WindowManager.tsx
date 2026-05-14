'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSystemStore } from '@/stores';
import { appConfig, type AppType } from './appConfig';

export const WindowManager: React.FC = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow, maximizeWindow, closeWindow, updateWindowPosition, updateWindowSize } =
    useSystemStore();

  const dragRef = useRef<{ windowId: string; startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);
  const resizeRef = useRef<{ windowId: string; startX: number; startY: number; startSize: { width: number; height: number } } | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  const handleMouseDown = useCallback((windowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const win = windows.find(w => w.id === windowId);
    if (win) {
      dragRef.current = {
        windowId,
        startX: e.clientX,
        startY: e.clientY,
        startPos: { ...win.position }
      };
      isDraggingRef.current = true;
      focusWindow(windowId);
    }
  }, [windows, focusWindow]);

  const handleResizeStart = useCallback((windowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const win = windows.find(w => w.id === windowId);
    if (win) {
      resizeRef.current = {
        windowId,
        startX: e.clientX,
        startY: e.clientY,
        startSize: { ...win.size }
      };
      isResizingRef.current = true;
      focusWindow(windowId);
    }
  }, [windows, focusWindow]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current && dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        updateWindowPosition(dragRef.current.windowId, {
          x: dragRef.current.startPos.x + deltaX,
          y: dragRef.current.startPos.y + deltaY
        });
      }
      if (isResizingRef.current && resizeRef.current) {
        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;
        const newWidth = Math.max(300, resizeRef.current.startSize.width + deltaX);
        const newHeight = Math.max(200, resizeRef.current.startSize.height + deltaY);
        updateWindowSize(resizeRef.current.windowId, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragRef.current = null;
      isResizingRef.current = false;
      resizeRef.current = null;
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

        const AppComponent = config.component;
        const isActive = activeWindowId === win.id;

        if (win.isMinimized) return null;

        const windowStyle = {
          left: win.isMaximized ? 0 : win.position.x,
          top: win.isMaximized ? 0 : win.position.y,
          width: win.isMaximized ? (typeof window !== 'undefined' ? window.innerWidth : 1000) : win.size.width,
          height: win.isMaximized ? (typeof window !== 'undefined' ? window.innerHeight - 56 : 700) : win.size.height,
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
            onClick={() => focusWindow(win.id)}
          >
            <div
              className="flex items-center justify-between px-4 py-2 border-b border-moss-cyan/20 cursor-move"
              onMouseDown={(e) => handleMouseDown(win.id, e)}
            >
              <div className="flex items-center gap-2">
                <div className="text-moss-cyan">{config.icon}</div>
                <span className="font-mono text-sm text-moss-white">{win.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 hover:bg-moss-cyan/10 rounded"
                  onClick={() => minimizeWindow(win.id)}
                >
                  <div className="w-3 h-0.5 bg-moss-white/60"></div>
                </button>
                <button
                  className="p-1 hover:bg-moss-cyan/10 rounded"
                  onClick={() => maximizeWindow(win.id)}
                >
                  <div className="w-3 h-3 border border-moss-white/60"></div>
                </button>
                <button
                  className="p-1 hover:bg-cyber-red/10 rounded"
                  onClick={() => closeWindow(win.id)}
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
              onMouseDown={(e) => handleResizeStart(win.id, e)}
            />
            <div
              className="absolute bottom-0 right-0 w-2 h-2 bg-moss-cyan/60 rounded-full"
              onMouseDown={(e) => handleResizeStart(win.id, e)}
            />
          </motion.div>
        );
      })}
    </>
  );
};