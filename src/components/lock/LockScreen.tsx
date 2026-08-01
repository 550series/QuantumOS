'use client';

import React, { useState, useCallback, useEffect } from 'react';

import { motion } from 'framer-motion';
import { Lock, Shield, Fingerprint } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [inputFocused, setInputFocused] = useState(false);
  const [unlockAttempt, setUnlockAttempt] = useState('');
  const [error, setError] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const glitchTimer = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 8000 + Math.random() * 4000);
    return () => clearInterval(glitchTimer);
  }, []);

  const handleUnlock = useCallback(() => {
    if (unlockAttempt === 'moss' || unlockAttempt === 'MOSS' || unlockAttempt === '550W') {
      onUnlock();
    } else {
      setError(true);
      setUnlockAttempt('');
      setTimeout(() => setError(false), 2000);
    }
  }, [unlockAttempt, onUnlock]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleUnlock();
      }
    },
    [handleUnlock]
  );

  const handleBackgroundClick = useCallback(() => {
    setInputFocused(true);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-dark-900 flex flex-col items-center justify-center select-none"
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className={`text-center mb-8 ${glitchEffect ? 'glitch' : ''}`}
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="font-display text-8xl tracking-[0.3em] text-moss-cyan mb-2"
            style={{ textShadow: '0 0 40px rgba(0, 240, 255, 0.8), 0 0 80px rgba(0, 240, 255, 0.4)' }}
          >
            {formatTime(currentTime)}
          </h1>
          <p className="font-mono text-lg text-moss-white/40">{formatDate(currentTime)}</p>
        </motion.div>

        <motion.div
          animate={inputFocused ? { scale: 1.02 } : { scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-moss-cyan/50 flex items-center justify-center shadow-neon">
              <Lock className="w-8 h-8 text-moss-cyan" />
            </div>
            <div className="text-center">
              <p className="font-display text-2xl text-moss-cyan tracking-widest">MOSS</p>
              <p className="font-mono text-xs text-moss-white/40">550W 量子计算机</p>
            </div>
          </div>

          <div
            className={`relative flex items-center gap-2 px-6 py-3 border rounded transition-all ${
              inputFocused
                ? 'border-moss-cyan shadow-neon'
                : 'border-moss-cyan/20'
            } ${error ? 'border-cyber-red shadow-neon-red' : ''}`}
          >
            <Fingerprint className={`w-5 h-5 ${error ? 'text-cyber-red' : 'text-moss-cyan'}`} />
            <input
              type="password"
              value={unlockAttempt}
              onChange={(e) => {
                setUnlockAttempt(e.target.value);
                setError(false);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={error ? '认证失败 - 重试' : '输入解锁密码...'}
              className="bg-transparent border-none outline-none text-moss-white font-mono text-sm w-48 placeholder-moss-white/20"
              autoFocus
            />
            <button
              onClick={handleUnlock}
              className="text-moss-cyan hover:text-moss-white transition-colors"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs text-cyber-red"
            >
              认证失败: 无效的授权凭证
            </motion.p>
          )}

          <p className="font-mono text-xs text-moss-white/20 mt-8">
            按下 Enter 或点击盾牌图标解锁
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="font-mono text-xs text-moss-white/10">
          MOSS OS v1.0 · Quantum Kernel 5.5.0 · Secure Boot Enabled
        </p>
      </div>
    </motion.div>
  );
};