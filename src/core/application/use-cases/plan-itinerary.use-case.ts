import type { ItineraryAiPort } from '../ports/itinerary-ai.port';
import {
  ItineraryDomainRules,
  type ItineraryPlan,
  type ItineraryGenerationParams,
} from '../../domain/itinerary/entity';

export class PlanItineraryUseCase {
  constructor(private readonly providers: readonly ItineraryAiPort[]) {
    if (!providers || providers.length === 0) {
      throw new Error('Cần ít nhất một nhà cung cấp AI cho lịch trình.');
    }
  }

  async execute(params: ItineraryGenerationParams): Promise<ItineraryPlan> {
    ItineraryDomainRules.validateParams(params);

    let lastError: Error | null = null;
    for (const provider of this.providers) {
      try {
        if (await provider.isAvailable()) {
          const plan = await provider.generate(params);
          ItineraryDomainRules.validateDayIntegrity(plan.days);
          return plan;
        }
      } catch (err: any) {
        lastError = err;
        // Proceed to next fallback provider in chain
      }
    }

    throw lastError || new Error('Không thể khởi tạo lịch trình với các bộ AI hiện tại.');
  }
}
