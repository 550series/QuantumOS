'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CodeRain } from './CodeRain';
import { MossEye } from './MossEye';
import { SystemStatus } from './SystemStatus';

type BootStage = 'black' | 'code_rain' | 'system_check' | 'moss_init' | 'complete';

const bootMessages = [
  { text: '正在初始化量子计算核心...', delay: 0 },
  { text: '加载人工智能决策引擎...', delay: 400 },
  { text: '检测系统硬件状态...', delay: 800 },
  { text: 'CPU: 量子处理器 128核心 [正常]', delay: 1200 },
  { text: '内存: 8192TB 量子内存 [正常]', delay: 1600 },
  { text: '存储: 无限量子存储 [正常]', delay: 2000 },
  { text: '网络: 量子纠缠通信 [已连接]', delay: 2400 },
  { text: 'AI核心: MOSS v4.0.0 [就绪]', delay: 2800 },
  { text: '', delay: 3200 },
  { text: 'MOSS人工智能操作系统启动完成', delay: 3600 },
  { text: '让人类永远保持理智', delay: 4000 },
];

export const BootSequence: React.FC = () => {
  const router = useRouter();
  const [stage, setStage] = useState<BootStage>('black');
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [showEye, setShowEye] = useState(false);

  useEffect(() => {
    const timeline = [
      { time: 0, action: () => setStage('black') },
      { time: 500, action: () => setStage('code_rain') },
      { time: 10000, action: () => setStage('system_check') }, // 延长代码雨阶段到10秒
      { time: 12000, action: () => setStage('moss_init') },
      { time: 12250, action: () => setShowEye(true) },
      { time: 14000, action: () => setStage('complete') },
      { time: 15000, action: () => router.push('/desktop') },
    ];

    const timeouts = timeline.map(({ time, action }) =>
      setTimeout(action, time)
    );

    // 进度条更新
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / 150; // 150次更新，总计15秒
      });
    }, 100);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [router]);

  // 系统检测消息
  useEffect(() => {
    if (stage === 'system_check') {
      bootMessages.forEach(({ text, delay }) => {
        setTimeout(() => {
          if (text) {
            setMessages((prev) => [...prev, text]);
          }
        }, delay);
      });
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 bg-moss-blue overflow-hidden">
      {/* 阶段1: 黑屏 */}
      <AnimatePresence>
        {stage === 'black' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="w-2 h-2 bg-moss-cyan rounded-full shadow-neon-strong"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 阶段2: 代码雨 */}
      <AnimatePresence>
        {stage === 'code_rain' && (
          <>
            <CodeRain />
            <SystemStatus />
          </>
        )}
      </AnimatePresence>

      {/* 阶段3: 系统检测 */}
      <AnimatePresence>
        {(stage === 'system_check' || stage === 'moss_init') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-start justify-center px-12 z-10"
          >
            <div className="w-full max-w-4xl">
              {/* 标题 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h1 className="font-display text-4xl text-moss-cyan mb-2 tracking-wider">
                  QUANTUM OS
                </h1>
                <p className="font-mono text-sm text-moss-white/60">
                  MOSS Artificial Intelligence Operating System v4.0.0
                </p>
              </motion.div>

              {/* 系统消息 */}
              <div className="font-mono text-sm space-y-2 mb-8 h-64 overflow-hidden">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-moss-white/80"
                  >
                    <span className="text-moss-cyan mr-2">{'>'}</span>
                    {msg}
                  </motion.div>
                ))}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-moss-cyan ml-1"
                />
              </div>

              {/* MOSS眼睛 */}
              <AnimatePresence>
                {showEye && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute right-12 top-1/2 -translate-y-1/2"
                  >
                    <MossEye />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-moss-blue/50 to-transparent">
        <div className="container mx-auto px-12 h-full flex flex-col justify-center">
          {/* 进度条 */}
          <div className="relative h-1 bg-moss-cyan/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-moss-cyan to-cyber-green"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* 进度文字 */}
          <div className="flex justify-between mt-2 font-mono text-xs text-moss-white/60">
            <span>MOSS SYSTEM INITIALIZATION</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
