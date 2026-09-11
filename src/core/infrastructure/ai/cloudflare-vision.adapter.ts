import type { VisionAiPort } from '../../application/ports/vision-ai.port';
import type { FoodRecognitionResult, VisionAnalysisParams, FoodItem } from '../../domain/vision/entity';

export class CloudflareVisionAdapter implements VisionAiPort {
  public readonly providerName = 'cloudflare-vision-ai';

  constructor(private readonly aiBinding: any) {}

  async isAvailable(): Promise<boolean> {
    return Boolean(this.aiBinding && typeof this.aiBinding.run === 'function');
  }

  async analyze(params: VisionAnalysisParams): Promise<FoodRecognitionResult> {
    const { image } = params;
    if (!image || image.length < 50) {
      throw new Error('Dữ liệu ảnh không đủ để xử lý.');
    }

    // Auto-accept Meta license policy
    await this.aiBinding.run('@cf/meta/llama-3.2-11b-vision-instruct', { prompt: 'agree' }).catch(() => {});

    const base64Data = image.split(',')[1] || image;
    const binaryString = atob(base64Data.slice(0, 500000));
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const visionRes = await this.aiBinding.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      image: Array.from(bytes),
      prompt: 'Nhận diện các món ăn hoặc thực đơn trong ảnh. Trả về DUY NHẤT một JSON array: [{"original":"tên gốc","translated":"tên tiếng Việt","price":"giá","category":"phân loại","confidence":0.95,"description":"mô tả ngắn"}]',
      max_tokens: 1000,
    });

    const text = visionRes?.response || '';
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket === -1 || lastBracket <= firstBracket) {
      throw new Error('Cloudflare Vision không trích xuất được mảng JSON.');
    }

    const items: FoodItem[] = JSON.parse(text.slice(firstBracket, lastBracket + 1));
    return {
      items,
      detectedLanguage: 'Cloudflare Llama 3.2 Vision',
      source: this.providerName,
      detectedAt: new Date().toISOString(),
      isLiveCameraSupported: true,
    };
  }
}
