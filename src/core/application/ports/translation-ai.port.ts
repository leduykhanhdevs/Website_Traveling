import type { TranslationResult, TranslationParams } from '../../domain/translation/entity';

export interface TranslationAiPort {
  readonly providerName: string;
  isAvailable(): Promise<boolean>;
  translate(params: TranslationParams): Promise<TranslationResult>;
}
