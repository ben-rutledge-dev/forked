// Data
import type { MealPlanEntry } from '@/data/meal-plans/[mealPlanId]/types';

export type PostEntryPayload = {
  slotId: string
  recipeId: string
  date: string
};

export type PostEntryResponse = MealPlanEntry;

export type PutEntriesReorderPayload = {
  entries: { id: string, orderIndex: number }[]
};

export type Params = {
  mealPlanId?: string
  startDate?: string
};
