import { z } from 'zod';
// Data
import type { MealPlanRole } from '@/data/meal-plans/types';

export const postMealPlanInviteSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.enum(['COLLABORATOR', 'VIEWER']),
});
export type PostMealPlanInvitePayload = z.infer<typeof postMealPlanInviteSchema>;

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
