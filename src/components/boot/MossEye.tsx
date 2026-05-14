'use client';

import React, { memo } from 'react';

export const MossEye = memo(function MossEye() {
  return (
    <div className="w-64 h-64 relative flex items-center justify-center">
      <style>{`
        @keyframes moss-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes moss-rotate-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes moss-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .moss-outer-ring {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 2px solid rgba(0, 240, 255, 0.8);
          animation: moss-rotate 6s linear infinite;
          position: absolute;
        }
        .moss-inner-ring {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid rgba(0, 240, 255, 0.6);
          animation: moss-rotate-reverse 4s linear infinite;
          position: absolute;
        }
        .moss-core {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #00F0FF;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.4);
          animation: moss-pulse 2s ease-in-out infinite;
          position: absolute;
        }
        .moss-scan-line-h {
          position: absolute;
          width: 130%;
          height: 1px;
          background: rgba(0, 240, 255, 0.3);
          top: 50%;
          left: -15%;
        }
        .moss-scan-line-v {
          position: absolute;
          width: 1px;
          height: 130%;
          background: rgba(0, 240, 255, 0.3);
          left: 50%;
          top: -15%;
        }
        .moss-decor-ring {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(0, 240, 255, 0.15);
          position: absolute;
        }
      `}</style>
      <div className="moss-decor-ring" />
      <div className="moss-outer-ring" />
      <div className="moss-inner-ring" />
      <div className="moss-scan-line-h" />
      <div className="moss-scan-line-v" />
      <div className="moss-core" />
    </div>
  );
});