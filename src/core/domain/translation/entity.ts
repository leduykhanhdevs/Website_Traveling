/**
 * Pure Domain Entities for Multilingual Communication Handbook
 * Zero external frameworks or libraries.
 */

export type TargetLanguageCode = 'ja' | 'ko' | 'en' | 'fr' | 'zh';

export interface SupportedLanguageInfo {
  readonly code: TargetLanguageCode;
  readonly label: string;
  readonly nativeLabel: string;
  readonly ttsLocale: string;
}

export interface TranslationResult {
  readonly originalText: string;
  readonly translatedText: string;
  readonly pronunciation?: string;
  readonly targetLang: TargetLanguageCode;
  readonly source: string;
}

export interface TranslationParams {
  readonly text: string;
  readonly targetLang: TargetLanguageCode;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguageInfo[] = [
  { code: 'ja', label: 'Tiếng Nhật', nativeLabel: '日本語', ttsLocale: 'ja-JP' },
  { code: 'ko', label: 'Tiếng Hàn', nativeLabel: '한국어', ttsLocale: 'ko-KR' },
  { code: 'en', label: 'Tiếng Anh', nativeLabel: 'English', ttsLocale: 'en-US' },
  { code: 'fr', label: 'Tiếng Pháp', nativeLabel: 'Français', ttsLocale: 'fr-FR' },
  { code: 'zh', label: 'Tiếng Trung', nativeLabel: '中文', ttsLocale: 'zh-CN' },
];
