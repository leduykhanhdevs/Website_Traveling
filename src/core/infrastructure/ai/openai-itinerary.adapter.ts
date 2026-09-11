import type { ItineraryAiPort } from '../../application/ports/itinerary-ai.port';
import type { ItineraryPlan, ItineraryGenerationParams } from '../../domain/itinerary/entity';

export class OpenAiItineraryAdapter implements ItineraryAiPort {
  public readonly providerName = 'openai-gpt-4o-mini';

  constructor(private readonly apiKey: string) {}

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().startsWith('sk-'));
  }

  async generate(params: ItineraryGenerationParams): Promise<ItineraryPlan> {
    const { destination, days, budgetRange, travelStyle } = params;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are Traveling trip planner. Return only valid JSON without markdown: {id:string,destination:string,budgetRange:string,totalEstimatedSpend:number,days:[{day:number,title:string,totalEstimatedSpend:number,slots:[{id:string,day:number,startTime:string,endTime:string,title:string,description:string,estimatedSpend:number}]}]}',
          },
          {
            role: 'user',
            content: `Plan a ${days}-day trip to ${destination} with style "${travelStyle}" and budget "${budgetRange}". Respond in Vietnamese.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error('OpenAI HTTP error: ' + res.status);
    }

    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const cleanJson = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      ...parsed,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
    };
  }
}
