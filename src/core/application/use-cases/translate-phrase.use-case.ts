import type { TranslationAiPort } from '../ports/translation-ai.port';
import type { TranslationResult, TranslationParams } from '../../domain/translation/entity';

export class TranslatePhraseUseCase {
  constructor(private readonly providers: readonly TranslationAiPort[]) {
    if (!providers || providers.length === 0) {
      throw new Error('Cần ít nhất một nhà cung cấp dịch thuật.');
    }
  }

  async execute(params: TranslationParams): Promise<TranslationResult> {
    const trimmed = (params.text || '').trim();
    if (!trimmed) {
      return {
        originalText: '',
        translatedText: '',
        targetLang: params.targetLang,
        source: 'empty-input',
      };
    }

    let lastError: Error | null = null;
    for (const provider of this.providers) {
      try {
        if (await provider.isAvailable()) {
          const result = await provider.translate({ text: trimmed, targetLang: params.targetLang });
          if (result && result.translatedText) {
            return result;
          }
        }
      } catch (err: any) {
        lastError = err;
        // Proceed to next fallback provider in chain
      }
    }

    throw lastError || new Error('Không thể thực hiện dịch thuật.');
  }
}
