export type MealPlanRole = 'OWNER' | 'COLLABORATOR' | 'VIEWER';

export type MealPlanWithStats = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  role: MealPlanRole
  memberCount: number
  slotCount: number
};

export type PendingMealPlanInvite = {
  id: string
  mealPlanId: string
  role: MealPlanRole
  createdAt: string
  mealPlan: {
    id: string
    title: string
  }
  invitedByUserId: string
};

export type MealPlansResponse = {
  plans: MealPlanWithStats[]
};

export type PendingMealPlanInvitesResponse = {
  pending: PendingMealPlanInvite[]
};

export type PostMealPlanPayload = {
  title?: string
};

export type PostMealPlanResponse = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
};
