// Data
import type { MealPlanRole } from '@/data/meal-plans/types';

export type PostMealPlanInvitePayload = {
  username: string
  role: 'COLLABORATOR' | 'VIEWER'
};

export type PostMealPlanInviteResponse = {
  id: string
  mealPlanId: string
  userId: string
  role: MealPlanRole
  acceptedAt: null
  invitedByUserId: string
  createdAt: string
};

export type Params = {
  mealPlanId?: string
};
