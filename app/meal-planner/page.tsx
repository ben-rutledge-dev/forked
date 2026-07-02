import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
// Data
import type { MealPlanMember, MealPlanSlot, MealPlanEntry } from '@/data/meal-plans/[mealPlanId]/types';
import type { MealPlanRole } from '@/data/meal-plans/types';
import { queryKeys } from '@/data/queryKeys';
// Components
import { MealPlannerClient } from './components/MealPlannerClient';
// Lib
import { auth } from '@/lib/auth';
import { getQueryClient } from '@/lib/getQueryClient';
import { prisma } from '@/lib/prisma';
// Utils
import { addDays, startOfWeek, toDateStr } from '@/utils/dates';

export const metadata: Metadata = { title: 'Meal Planner' };

const MealPlannerPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });

  const allMemberships = await prisma.mealPlanMember.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: {
      mealPlan: {
        include: {
          slots: { orderBy: { orderIndex: 'asc' } },
          members: {
            include: {
              user: { select: { id: true, name: true, username: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  const pending = allMemberships
    .filter(m => m.acceptedAt === null)
    .map(m => ({
      id: m.id,
      mealPlanId: m.mealPlanId,
      role: m.role,
      createdAt: m.createdAt.toISOString(),
      mealPlan: { id: m.mealPlan.id, title: m.mealPlan.title },
      invitedByUserId: m.invitedByUserId,
    }));

  const membership = allMemberships.find(m => m.acceptedAt !== null) ?? null;

  if (!membership) {
    const emptyClient = getQueryClient();
    emptyClient.setQueryData(queryKeys.mealPlans.pending(), { pending });
    return (
      <HydrationBoundary state={dehydrate(emptyClient)}>
        <MealPlannerClient
          planId={null}
          isPremium={user?.isPremium ?? false}
          currentUserId={userId}
          initialData={null}
          initialStartDate={null}
        />
      </HydrationBoundary>
    );
  }

  const plan = membership.mealPlan;

  const todayStr = toDateStr(new Date());
  const startDateStr = user?.isPremium ? startOfWeek(todayStr) : todayStr;
  const endDateStr = addDays(startDateStr, 6);

  const entries = await prisma.mealPlanEntry.findMany({
    where: {
      mealPlanId: plan.id,
      date: { gte: new Date(startDateStr), lte: new Date(endDateStr) },
    },
    include: {
      recipe: { select: { id: true, title: true, coverImageUrl: true } },
    },
    orderBy: { orderIndex: 'asc' },
  });

  const initialData = {
    id: plan.id,
    title: plan.title,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    currentUserRole: membership.role as MealPlanRole,
    members: plan.members.map(m => ({
      id: m.id,
      mealPlanId: m.mealPlanId,
      userId: m.userId,
      role: m.role as MealPlanRole,
      acceptedAt: m.acceptedAt?.toISOString() ?? null,
      invitedByUserId: m.invitedByUserId,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    })) as MealPlanMember[],
    slots: plan.slots.map(s => ({
      id: s.id,
      mealPlanId: s.mealPlanId,
      label: s.label,
      isDefault: s.isDefault,
      orderIndex: s.orderIndex,
      createdAt: s.createdAt.toISOString(),
    })) as MealPlanSlot[],
    entries: entries.map(e => ({
      id: e.id,
      mealPlanId: e.mealPlanId,
      slotId: e.slotId,
      recipeId: e.recipeId,
      date: e.date.toISOString().split('T')[0],
      orderIndex: e.orderIndex,
      createdAt: e.createdAt.toISOString(),
      recipe: e.recipe,
    })) as MealPlanEntry[],
  };

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.mealPlans.week(plan.id, startDateStr), initialData);
  queryClient.setQueryData(queryKeys.mealPlans.pending(), { pending });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MealPlannerClient
        planId={plan.id}
        isPremium={user?.isPremium ?? false}
        currentUserId={userId}
        initialData={initialData}
        initialStartDate={startDateStr}
      />
    </HydrationBoundary>
  );
};

export default MealPlannerPage;
