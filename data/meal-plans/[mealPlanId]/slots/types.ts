import { z } from 'zod';
// Data
import type { MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';

export const postSlotSchema = z.object({
  label: z.string().min(1, 'Slot name is required'),
});
export type PostSlotPayload = z.infer<typeof postSlotSchema>;

export type PostSlotResponse = MealPlanSlot;

export type PutSlotsReorderPayload = {
  slots: { id: string, orderIndex: number }[]
};

export type Params = {
  mealPlanId?: string
};
