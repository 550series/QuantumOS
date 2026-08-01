'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

import { useSystemStore } from '@/stores';

interface CommandResult {
  output: string[];
  type: 'normal' | 'error' | 'success' | 'warning';
}

const commands: Record<string, (args: string[]) => CommandResult> = {
  help: () => ({
    output: [
      'MOSS Terminal v1.0 - 可用命令:',
      '',
      '  help        - 显示帮助信息',
      '  clear       - 清除终端',
      '  status      - 显示系统状态',
      '  date        - 显示当前日期时间',
      '  whoami      - 显示当前用户',
      '  ls          - 列出目录',
      '  echo [msg]  - 输出消息',
      '  version     - 显示版本信息',
      '  neofetch    - 系统信息',
      '  moss        - 显示 MOSS ASCII 艺术',
      '',
    ],
    type: 'normal',
  }),
  clear: () => ({ output: ['__CLEAR__'], type: 'normal' }),
  // status 命令由组件内的动态分支处理（读取实时 systemStore.status）
  date: () => ({
    output: [new Date().toLocaleString('zh-CN')],
    type: 'normal',
  }),
  whoami: () => ({
    output: ['用户: MOSS-OPERATOR', '权限: 管理员'],
    type: 'normal',
  }),
  ls: () => ({
    output: [
      '总用量 42',
      'drwxr-xr-x  /system    系统核心',
      'drwxr-xr-x  /tasks     任务调度',
      'drwxr-xr-x  /ai        决策引擎',
      'drwxr-xr-x  /logs      系统日志',
      'drwxr-xr-x  /data      数据存储',
      '-rw-r--r--  boot.cfg   启动配置',
      '-rw-r--r--  moss.conf  核心配置',
    ],
    type: 'normal',
  }),
  echo: (args) => ({
    output: [args.join(' ')],
    type: 'normal',
  }),
  version: () => ({
    output: [
      'QuantumOS v1.0.0',
      'MOSS Kernel 5.5.0 (x86_64-quantum)',
      'Build: 2075-05-15T08:00:00 CST',
    ],
    type: 'normal',
  }),
  neofetch: () => ({
    output: [
      '      ./o.                  OPERATOR@MOSS-550W',
      '    ./sssso-                ──────────────────',
      '   `:osssssss+-             OS: QuantumOS v1.0',
      '  `:+sssssssssso/.          Kernel: MOSS 5.5.0',
      '  `-/osssssssssssso/.       Shell: moss-sh',
      '    `-/+sssssssssssssso/.   CPU: Quantum Core (550W)',
      '        `-:/+sssssssssssss  Memory: 8192MB',
      '            `.://oosssssss  AI Engine: MOSS-3',
      '',
    ],
    type: 'normal',
  }),
  moss: () => ({
    output: [
      '  ███╗   ███╗ ██████╗ ███████╗███████╗',
      '  ████╗ ████║██╔═══██╗██╔════╝██╔════╝',
      '  ██╔████╔██║██║   ██║███████╗███████╗',
      '  ██║╚██╔╝██║██║   ██║╚════██║╚════██║',
      '  ██║ ╚═╝ ██║╚██████╔╝███████║███████║',
      '  ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚══════╝',
      '',
      '  Quantum Operating System',
      '  MOSS - 550 Series Quantum Computer',
      '',
    ],
    type: 'success',
  }),
};

export const MossTerminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ text: string; type: CommandResult['type'] }>>([
    { text: 'MOSS Terminal v1.0 - 输入 help 查看可用命令', type: 'normal' },
    { text: '', type: 'normal' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const status = useSystemStore((s) => s.status);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      setHistory((prev) => [...prev, { text: `$ ${trimmed}`, type: 'normal' }]);

      if (command in commands) {
        const result = commands[command](args);
        if (result.output[0] === '__CLEAR__') {
          setHistory([]);
        } else {
          result.output.forEach((line) => {
            setHistory((prev) => [...prev, { text: line, type: result.type }]);
          });
        }
      } else if (command === 'status') {
        const systemStatus = [
          `CPU: ${Math.round(status.cpu)}%`,
          `内存: ${Math.round(status.memory.percentage)}% (${Math.round(status.memory.used)}MB / ${status.memory.total}MB)`,
          `网络: ↓${Math.round(status.network.download)}KB/s ↑${Math.round(status.network.upload)}KB/s`,
          `运行时间: ${Math.floor(status.uptime / 3600)}h ${Math.floor((status.uptime % 3600) / 60)}m`,
        ];
        systemStatus.forEach((line) => {
          setHistory((prev) => [...prev, { text: line, type: 'success' }]);
        });
      } else {
        setHistory((prev) => [
          ...prev,
          { text: `命令未找到: ${command}。输入 help 查看可用命令。`, type: 'error' },
        ]);
      }

      setCommandHistory((prev) => [trimmed, ...prev].slice(0, 50));
      setHistoryIndex(-1);
      setInput('');
    },
    [status]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        executeCommand(input);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    },
    [input, executeCommand, commandHistory, historyIndex]
  );

  return (
    <div
      className="flex flex-col h-full bg-dark-900 font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={outputRef} className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed">
        {history.map((entry, i) => (
          <div
            key={i}
            className={
              entry.type === 'error'
                ? 'text-cyber-red'
                : entry.type === 'success'
                  ? 'text-cyber-green'
                  : entry.type === 'warning'
                    ? 'text-cyber-orange'
                    : 'text-moss-white/80'
            }
          >
            {entry.text || '\u00A0'}
          </div>
        ))}
        <div className="flex items-center text-moss-cyan">
          <span className="mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-moss-white font-mono text-sm p-0"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};