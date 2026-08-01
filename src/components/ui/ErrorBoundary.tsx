'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 上报错误，便于排查（与 #30 监控基建联动时可替换为 Sentry 等）。
    console.error('[ErrorBoundary] 捕获到渲染异常:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 flex items-center justify-center bg-moss-blue">
          <div className="glass-panel p-8 max-w-md text-center">
            <h2 className="font-display text-xl text-cyber-red mb-4">
              系统错误
            </h2>
            <p className="text-sm text-moss-white/60 mb-4 font-mono">
              {this.state.error?.message || '发生未知错误'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 border border-moss-cyan text-moss-cyan rounded hover:bg-moss-cyan/10 transition-colors font-mono text-sm"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}