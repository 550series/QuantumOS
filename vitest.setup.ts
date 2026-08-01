import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// RTL 自动清理：每个测试结束后卸载挂载的组件
afterEach(() => {
  cleanup();
});

// jsdom 不实现 matchMedia，部分依赖主题/动画的组件会用到，预置桩
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
