// Data
import type { MealPlanRole } from '@/data/meal-plans/types';

export type MealPlanMemberUser = {
  id: string
  name: string | null
  username: string | null
  avatarUrl: string | null
};

export type MealPlanMember = {
  id: string
  mealPlanId: string
  userId: string
  role: MealPlanRole
  acceptedAt: string | null
  invitedByUserId: string
  createdAt: string
  user: MealPlanMemberUser
};

export type MealPlanSlot = {
  id: string
  mealPlanId: string
  label: string
  isDefault: boolean
  orderIndex: number
  createdAt: string
};

export type MealPlanRecipe = {
  id: string
  title: string
  coverImageUrl: string | null
};

export type MealPlanEntry = {
  id: string
  mealPlanId: string
  slotId: string
  recipeId: string | null
  date: string
  orderIndex: number
  createdAt: string
  recipe: MealPlanRecipe | null
};

export type MealPlanDetail = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  currentUserRole: MealPlanRole
  members: MealPlanMember[]
  slots: MealPlanSlot[]
  entries: MealPlanEntry[]
};

export type PutMealPlanPayload = {
  title: string
};

export type PutMealPlanResponse = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
};

export type Params = {
  mealPlanId?: string
  startDate?: string
  endDate?: string
};
