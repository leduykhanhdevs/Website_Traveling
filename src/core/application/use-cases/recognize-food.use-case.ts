import type { VisionAiPort } from '../ports/vision-ai.port';
import type { FoodRecognitionResult, VisionAnalysisParams } from '../../domain/vision/entity';

export class RecognizeFoodUseCase {
  constructor(private readonly providers: readonly VisionAiPort[]) {
    if (!providers || providers.length === 0) {
      throw new Error('Cần ít nhất một nhà cung cấp thị giác AI.');
    }
  }

  async execute(params: VisionAnalysisParams): Promise<FoodRecognitionResult> {
    if (!params.image && !params.categoryHint) {
      throw new Error('Vui lòng cung cấp hình ảnh hoặc chủ đề thực đơn cần nhận diện.');
    }

    let lastError: Error | null = null;
    for (const provider of this.providers) {
      try {
        if (await provider.isAvailable()) {
          const result = await provider.analyze(params);
          if (result && result.items && result.items.length > 0) {
            return result;
          }
        }
      } catch (err: any) {
        lastError = err;
        // Proceed to next fallback provider in chain
      }
    }

    throw lastError || new Error('Không thể nhận diện hình ảnh với các bộ thị giác hiện tại.');
  }
}
