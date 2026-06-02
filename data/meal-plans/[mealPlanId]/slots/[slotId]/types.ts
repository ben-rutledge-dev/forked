// Data
import type { MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';

export type PutSlotPayload = {
  label?: string
  orderIndex?: number
};

export type PutSlotResponse = MealPlanSlot;

export type DeleteSlotPayload = {
  slotId: string
};

export type Params = {
  mealPlanId?: string
  slotId?: string
};
