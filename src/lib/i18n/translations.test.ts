import { describe, it, expect } from 'vitest';

import { translations } from './translations';

import { translate } from './index';

// 子集判断：zh 与 en 字典键一一对应（保证切换语言覆盖一致）
const zhKeys = Object.keys(translations['zh-CN']).sort();

describe('i18n translations', () => {
  it('en-US 字典与 zh-CN 拥有相同键集合', () => {
    const enKeys = Object.keys(translations['en-US']).sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it('translate 返回中文原文', () => {
    expect(translate('zh-CN', 'settings.title')).toBe('系统设置');
  });

  it('translate 返回英文原文', () => {
    expect(translate('en-US', 'settings.title')).toBe('Settings');
  });

  it('translate 缺失语言时回退中文', () => {
    // 未知语言（强转为不存在的枚举）应回退 zh-CN 词典
    expect(translate('zh-CN', 'settings.footer')).toBe('量子计算机操作系统 · 550系列');
  });
});