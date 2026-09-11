import type { ItineraryPlan, ItineraryGenerationParams } from '../../domain/itinerary/entity';

export interface ItineraryAiPort {
  readonly providerName: string;
  isAvailable(): Promise<boolean>;
  generate(params: ItineraryGenerationParams): Promise<ItineraryPlan>;
}
