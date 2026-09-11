import type { VisionAiPort } from '../../application/ports/vision-ai.port';
import type { FoodRecognitionResult, VisionAnalysisParams, FoodItem } from '../../domain/vision/entity';

export class OpenAiVisionAdapter implements VisionAiPort {
  public readonly providerName = 'openai-gpt-4o-mini-vision';

  constructor(private readonly apiKey: string) {}

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().startsWith('sk-'));
  }

  async analyze(params: VisionAnalysisParams): Promise<FoodRecognitionResult> {
    const { image, scanMode } = params;
    const prompt = scanMode === 'dish'
      ? 'Nhận diện chính xác đĩa món ăn hoặc đồ uống thực tế trong ảnh này. Xác định tên món, nguyên liệu, hương vị, giá ước tính và nguồn gốc.'
      : 'Trích xuất danh sách món ăn và giá tiền trên thực đơn hoặc biển hiệu trong ảnh này.';

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt + ' Luôn trả về DUY NHẤT một JSON array không kèm markdown: [{"original":"tên món ngôn ngữ gốc","translated":"tên dịch tiếng Việt chuẩn","price":"giá ước tính kèm đơn vị","category":"Món chính/Khai vị/Đồ uống/Tráng miệng/Món nướng/Món nước","confidence":0.98,"description":"mô tả ngắn nguyên liệu và hương vị"}]',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: image.startsWith('data:') ? image : 'data:image/jpeg;base64,' + image } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!openAiRes.ok) {
      throw new Error('OpenAI Vision HTTP error: ' + openAiRes.status);
    }

    const resData: any = await openAiRes.json();
    const content = resData.choices?.[0]?.message?.content || '';
    const firstBracket = content.indexOf('[');
    const lastBracket = content.lastIndexOf(']');
    if (firstBracket === -1 || lastBracket <= firstBracket) {
      throw new Error('OpenAI Vision không trả về JSON hợp lệ.');
    }

    const items: FoodItem[] = JSON.parse(content.slice(firstBracket, lastBracket + 1));
    return {
      items,
      detectedLanguage: 'AI Thị Giác Chuẩn Xác',
      source: this.providerName,
      detectedAt: new Date().toISOString(),
      isLiveCameraSupported: true,
    };
  }
}
