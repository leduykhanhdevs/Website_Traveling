import type { ItineraryAiPort } from '../../application/ports/itinerary-ai.port';
import type { ItineraryPlan, ItineraryGenerationParams } from '../../domain/itinerary/entity';

export class CloudflareItineraryAdapter implements ItineraryAiPort {
  public readonly providerName = 'cloudflare-workers-ai';

  constructor(private readonly aiBinding: any) {}

  async isAvailable(): Promise<boolean> {
    return Boolean(this.aiBinding && typeof this.aiBinding.run === 'function');
  }

  async generate(params: ItineraryGenerationParams): Promise<ItineraryPlan> {
    const { destination, days, budgetRange, travelStyle } = params;
    const prompt = `Lập lịch trình du lịch ${days} ngày tại ${destination} với phong cách "${travelStyle}" và mức chi tiêu "${budgetRange}".
Trả về duy nhất định dạng JSON thuần không có markdown:
{"id":"${Date.now()}","destination":"${destination}","budgetRange":"${budgetRange}","totalEstimatedSpend":150,"days":[{"day":1,"title":"Khám phá trung tâm","totalEstimatedSpend":150,"slots":[{"id":"slot-1","day":1,"startTime":"08:30","endTime":"11:30","title":"Điểm tham quan","description":"Mô tả hoạt động","estimatedSpend":50}]}]}`;

    const aiRes = await this.aiBinding.run('@cf/meta/llama-3-8b-instruct', {
      prompt,
      max_tokens: 3000,
    });

    const text = aiRes?.response || '';
    const cleanJson = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const firstBracket = cleanJson.indexOf('{');
    const lastBracket = cleanJson.lastIndexOf('}');
    if (firstBracket === -1 || lastBracket <= firstBracket) {
      throw new Error('Cloudflare AI trả về dữ liệu không hợp lệ.');
    }
    const parsed = JSON.parse(cleanJson.slice(firstBracket, lastBracket + 1));
    return {
      ...parsed,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
    };
  }
}
