'use client';

import { useEffect } from 'react';

import { useSystemStore } from '@/stores';

/**
 * issue #47：根据 store 中的 config.theme 在 <html> 上设置 data-theme，
 * 供 globals.css 中 [data-theme='light'] 亮色变量生效。
 */
export const ThemeProvider: React.FC = () => {
  const theme = useSystemStore((s) => s.config.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.dataset.theme = 'light';
    } else {
      delete root.dataset.theme;
    }
  }, [theme]);

  return null;
};