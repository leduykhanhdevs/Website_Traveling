import type { TranslationAiPort } from '../../application/ports/translation-ai.port';
import type { TranslationResult, TranslationParams } from '../../domain/translation/entity';

export class CloudflareTranslationAdapter implements TranslationAiPort {
  public readonly providerName = 'cloudflare-workers-ai';

  constructor(private readonly aiBinding: any) {}

  async isAvailable(): Promise<boolean> {
    return Boolean(this.aiBinding && typeof this.aiBinding.run === 'function');
  }

  async translate(params: TranslationParams): Promise<TranslationResult> {
    const { text, targetLang } = params;
    const translation = await this.aiBinding.run('@cf/meta/m2m100-1.2b', {
      text,
      source_lang: 'vi',
      target_lang: targetLang,
    });

    if (!translation?.translated_text) {
      throw new Error('Cloudflare AI không thể dịch chuỗi này.');
    }

    return {
      originalText: text,
      translatedText: translation.translated_text,
      targetLang,
      source: this.providerName,
    };
  }
}
