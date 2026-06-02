// Data
import type { MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';

export type PostSlotPayload = {
  label: string
};

export type PostSlotResponse = MealPlanSlot;

export type PutSlotsReorderPayload = {
  slots: { id: string, orderIndex: number }[]
};

export type Params = {
  mealPlanId?: string
};
