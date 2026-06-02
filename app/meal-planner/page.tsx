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

export const metadata: Metadata = { title: 'Meal Planner' };

// Date helpers operate on YYYY-MM-DD strings and mirror the client exactly so
// the server-rendered start date matches what the client computes for "today".
// (Using Date.getDay()/toISOString() together silently shifts the day in
// timezones ahead of UTC, which made the planner open on a past read-only week.)
const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

const addDaysStr = (dateStr: string, days: number) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().split('T')[0];
};

const startOfWeekStr = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDaysStr(dateStr, diff);
};

const MealPlannerPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });

  const membership = await prisma.mealPlanMember.findFirst({
    where: { userId, acceptedAt: { not: null } },
    orderBy: { createdAt: 'asc' },
    include: {
      mealPlan: {
        include: {
          slots: { orderBy: { orderIndex: 'asc' } },
          members: {
            where: { acceptedAt: { not: null } },
            include: {
              user: { select: { id: true, name: true, username: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!membership) {
    const emptyClient = getQueryClient();
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
  const startDateStr = user?.isPremium ? startOfWeekStr(todayStr) : todayStr;
  const endDateStr = addDaysStr(startDateStr, 6);

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
  queryClient.setQueryData(
    queryKeys.mealPlans.week(plan.id, startDateStr),
    initialData,
  );

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
