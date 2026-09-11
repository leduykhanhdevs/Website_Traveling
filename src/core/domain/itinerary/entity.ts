/**
 * Pure Domain Entities for Travel Itinerary Planning
 * Inward dependency rule: Zero external frameworks or libraries.
 */

export type BudgetRange = 'budget' | 'midrange' | 'premium';

export interface ActivitySlot {
  readonly id: string;
  readonly day: number;
  readonly startTime: string; // HH:mm format
  readonly endTime: string;   // HH:mm format
  readonly title: string;
  readonly description: string;
  readonly estimatedSpend: number; // USD per person
}

export interface DaySchedule {
  readonly day: number;
  readonly title: string;
  readonly totalEstimatedSpend: number;
  readonly slots: readonly ActivitySlot[];
}

export interface ItineraryPlan {
  readonly id: string;
  readonly destination: string;
  readonly budgetRange: BudgetRange;
  readonly totalEstimatedSpend: number;
  readonly days: readonly DaySchedule[];
  readonly currency: 'USD';
  readonly generatedAt: string;
}

export interface ItineraryGenerationParams {
  readonly destination: string;
  readonly days: number;
  readonly travelStyle: string;
  readonly budgetRange: BudgetRange;
}

export class ItineraryDomainRules {
  static validateParams(params: ItineraryGenerationParams): void {
    if (!params.destination || params.destination.trim().length < 2) {
      throw new Error('Điểm đến phải có ít nhất 2 ký tự.');
    }
    if (params.days < 1 || params.days > 7 || !Number.isInteger(params.days)) {
      throw new Error('Số ngày lịch trình phải từ 1 đến 7 ngày.');
    }
    if (!['budget', 'midrange', 'premium'].includes(params.budgetRange)) {
      throw new Error('Mức chi tiêu không hợp lệ.');
    }
  }

  static validateDayIntegrity(days: readonly DaySchedule[]): void {
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      if (d.day !== i + 1) {
        throw new Error('Thứ tự các ngày không liên tục.');
      }
      if (!d.slots || d.slots.length === 0) {
        throw new Error(`Ngày ${d.day} phải có ít nhất một hoạt động.`);
      }
      for (const slot of d.slots) {
        if (slot.startTime >= slot.endTime) {
          throw new Error(`Thời gian không hợp lệ tại ${slot.title}: ${slot.startTime} đến ${slot.endTime}`);
        }
      }
    }
  }
}
