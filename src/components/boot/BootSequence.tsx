'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CodeRain } from './CodeRain';
import { MossEye } from './MossEye';
import { SystemStatus } from './SystemStatus';

type BootStage = 'black' | 'code_rain' | 'system_check' | 'moss_init' | 'complete' | 'error';

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

const errorModules = [
  { name: '量子计算核心 (QUANTUM_CORE)', code: 'ERR_QC_0x7F', detail: '量子态坍缩异常，无法建立稳定量子比特' },
  { name: 'AI决策引擎 (AI_ENGINE)', code: 'ERR_AI_0x3E', detail: '神经网络权重矩阵损坏，推理管线中断' },
  { name: '内存管理模块 (MEM_MGR)', code: 'ERR_MEM_0x1A', detail: '量子内存页错误，ECC校验失败' },
  { name: '存储系统 (STORAGE)', code: 'ERR_STOR_0x5C', detail: '量子存储单元读取超时，数据完整性校验失败' },
  { name: '网络通信模块 (NETWORK)', code: 'ERR_NET_0x2D', detail: '量子纠缠信道失谐，通信链路中断' },
  { name: '量子处理器 (QPU)', code: 'ERR_QPU_0x4B', detail: '量子处理器核心温度异常，触发安全关机' },
  { name: 'MOSS核心服务 (MOSS_CORE)', code: 'ERR_MOSS_0x01', detail: '核心服务初始化失败，系统完整性校验未通过' },
];

export const BootSequence = memo(function BootSequence() {
  const router = useRouter();
  const [stage, setStage] = useState<BootStage>('black');
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [showEye, setShowEye] = useState(false);
  const [bootFailed, setBootFailed] = useState(false);
  const [errorModule, setErrorModule] = useState<typeof errorModules[number] | null>(null);
  const failedRef = useRef(false);

  useEffect(() => {
    if (failedRef.current) return;
    if (Math.random() < 0.03) {
      failedRef.current = true;
      const randomModule = errorModules[Math.floor(Math.random() * errorModules.length)];
      setErrorModule(randomModule);
      setBootFailed(true);
    }
  }, []);

  useEffect(() => {
    if (bootFailed) {
      const timeline = [
        { time: 0, action: () => setStage('black') },
        { time: 500, action: () => setStage('code_rain') },
        { time: 10000, action: () => setStage('system_check') },
        { time: 11500, action: () => setStage('error') },
      ];

      const timeouts = timeline.map(({ time, action }) =>
        setTimeout(action, time)
      );

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const target = 78 + Math.random() * 10;
          if (prev >= target) return target;
          return prev + 100 / 75;
        });
      }, 200);

      return () => {
        timeouts.forEach(clearTimeout);
        clearInterval(progressInterval);
      };
    }

    const timeline = [
      { time: 0, action: () => setStage('black') },
      { time: 500, action: () => setStage('code_rain') },
      { time: 10000, action: () => setStage('system_check') },
      { time: 12000, action: () => setStage('moss_init') },
      { time: 12250, action: () => setShowEye(true) },
      { time: 14000, action: () => setStage('complete') },
      { time: 15000, action: () => router.push('/desktop') },
    ];

    const timeouts = timeline.map(({ time, action }) =>
      setTimeout(action, time)
    );

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / 75;
      });
    }, 200);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [router, bootFailed]);

  useEffect(() => {
    if (stage === 'system_check' && !bootFailed) {
      bootMessages.forEach(({ text, delay }) => {
        setTimeout(() => {
          if (text) {
            setMessages((prev) => [...prev, text]);
          }
        }, delay);
      });
    }
  }, [stage, bootFailed]);

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

      {/* 阶段5: 启动失败 */}
      <AnimatePresence>
        {stage === 'error' && errorModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-start justify-center px-12 z-10"
          >
            <div className="w-full max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="font-display text-4xl text-red-500 mb-2 tracking-wider">
                  QUANTUM OS
                </h1>
                <p className="font-mono text-sm text-red-400/80">
                  SYSTEM BOOT FAILURE - CRITICAL ERROR
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="border border-red-500/30 bg-red-950/40 rounded-lg p-6 mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-2xl"
                  >
                    ⚠
                  </motion.span>
                  <div>
                    <div className="font-mono text-lg text-red-400">
                      [{errorModule.code}]
                    </div>
                    <div className="font-mono text-sm text-red-300/80 mt-1">
                      故障模块: {errorModule.name}
                    </div>
                  </div>
                </div>

                <div className="font-mono text-xs text-red-300/60 space-y-1 pl-10">
                  <div>{'>'} {errorModule.detail}</div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {'>'} 错误时间戳: {new Date().toISOString()}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    {'>'} 系统状态: KERNEL PANIC
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    className="text-red-400/80 mt-2"
                  >
                    {'>'} 建议操作: 重新启动系统或联系MOSS技术支持
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="font-mono text-xs text-red-400/40 leading-relaxed"
              >
                <div>STACK TRACE:</div>
                <div className="mt-1 pl-4 border-l border-red-500/20">
                  <div>{'>>'} quantum_core::initialize() +0x7F</div>
                  <div>{'>>'} ai_engine::load_weights() +0x3E</div>
                  <div>{'>>'} {errorModule.name.toLowerCase().replace(/\s/g, '_')}::start() +0xFF</div>
                  <div>{'>>'} moss_kernel::boot() +0x01</div>
                </div>
              </motion.div>
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
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                stage === 'error'
                  ? 'from-red-500 to-red-400'
                  : 'from-moss-cyan to-cyber-green'
              }`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* 进度文字 */}
          <div className="flex justify-between mt-2 font-mono text-xs text-moss-white/60">
            <span className={stage === 'error' ? 'text-red-400/80' : ''}>
              {stage === 'error' ? 'MOSS SYSTEM FAILURE' : 'MOSS SYSTEM INITIALIZATION'}
            </span>
            <span className={stage === 'error' ? 'text-red-400/80' : ''}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
});
