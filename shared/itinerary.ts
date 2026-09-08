import { z } from 'zod';

// Matches packages/shared/src/types/itinerary.ts in the Traveling app. Spend is USD.
export const requestSchema = z.object({
  destination: z.string().trim().min(2).max(120),
  days: z.number().int().min(1).max(7),
  budgetRange: z.enum(['budget', 'midrange', 'premium']),
  travelStyle: z.string().trim().min(2).max(200),
}).strict();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const money = z.number().finite().min(0).max(1_000_000);
export const planSchema = z.object({
  id: z.string().min(1).max(100),
  destination: z.string().min(1).max(200),
  budgetRange: z.enum(['budget', 'midrange', 'premium']),
  totalEstimatedSpend: money,
  days: z.array(z.object({
    day: z.number().int().min(1).max(7),
    title: z.string().min(1).max(255),
    totalEstimatedSpend: money,
    slots: z.array(z.object({
      id: z.string().min(1).max(100),
      day: z.number().int().min(1).max(7),
      startTime: time, endTime: time,
      title: z.string().min(1).max(255),
      description: z.string().max(2000),
      estimatedSpend: money,
    })).min(1).max(8),
  })).min(1).max(7),
}).superRefine((plan, ctx) => {
  const ids = new Set<string>();
  let total = 0;
  for (const [i, day] of plan.days.entries()) {
    let end = '', subtotal = 0;
    if (day.day !== i + 1) ctx.addIssue({ code: 'custom', message: 'Ngày không liên tục' });
    for (const slot of day.slots) {
      if (slot.day !== day.day || slot.startTime >= slot.endTime || slot.startTime < end || ids.has(slot.id)) {
        ctx.addIssue({ code: 'custom', message: 'Hoạt động trùng hoặc thời gian không hợp lệ' });
      }
      ids.add(slot.id); end = slot.endTime; subtotal += slot.estimatedSpend;
    }
    if (Math.abs(subtotal - day.totalEstimatedSpend) > 0.05) ctx.addIssue({ code: 'custom', message: 'Sai tổng chi phí ngày' });
    total += subtotal;
  }
  if (Math.abs(total - plan.totalEstimatedSpend) > 0.05) ctx.addIssue({ code: 'custom', message: 'Sai tổng chi phí' });
});
export type ItineraryPlan = z.infer<typeof planSchema>;
export type ItineraryRequest = z.infer<typeof requestSchema>;

export function validateGeneratedPlan(value: unknown, request: ItineraryRequest) {
  const plan = planSchema.parse(value);
  if (plan.days.length !== request.days || plan.budgetRange !== request.budgetRange || plan.destination !== request.destination) {
    throw new Error('Lịch trình không khớp yêu cầu');
  }
  return plan;
}
