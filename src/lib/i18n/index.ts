'use client';

import { useSystemStore } from '@/stores';

import { translations, type SupportedLanguage, type TranslationKey } from './translations';

/**
 * issue #52：轻量 i18n hook。
 * 语言来源为 systemStore 中的 config.language，切换语言后所有订阅组件自动重渲染。
 */
export function useTranslations() {
  const language = useLanguage();

  return {
    language,
    t: (key: TranslationKey): string => translate(language, key),
    translate,
  };
}

/**
 * 读取当前语言。
 */
export function useLanguage(): SupportedLanguage {
  const language = useSystemStore((s) => s.config.language) as SupportedLanguage;
  return language in translations ? language : 'zh-CN';
}

/**
 * 无状态翻译函数，按给定语言查询字典，缺失时回退中文，再回退键名。
 */
export function translate(language: SupportedLanguage, key: TranslationKey): string {
  const dict = translations[language] ?? translations['zh-CN'];
  const value = dict[key];
  if (typeof value === 'string') return value;
  const fallback = translations['zh-CN'][key];
  return typeof fallback === 'string' ? fallback : String(key);
}