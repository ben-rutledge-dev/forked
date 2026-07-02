import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const members = await prisma.mealPlanMember.findMany({
    where: { userId, acceptedAt: { not: null } },
    include: {
      mealPlan: {
        include: {
          members: { where: { acceptedAt: { not: null } } },
          slots: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const plans = members.map(m => ({
    id: m.mealPlan.id,
    title: m.mealPlan.title,
    createdAt: m.mealPlan.createdAt.toISOString(),
    updatedAt: m.mealPlan.updatedAt.toISOString(),
    role: m.role,
    memberCount: m.mealPlan.members.length,
    slotCount: m.mealPlan.slots.length,
  }));

  return NextResponse.json({ plans });
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = body.title?.trim() || 'My Meal Plan';

  try {
    const plan = await prisma.mealPlan.create({
      data: {
        title,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
            acceptedAt: new Date(),
            invitedByUserId: session.user.id,
          },
        },
        slots: {
          create: [
            { label: 'Breakfast', isDefault: true, orderIndex: 0 },
            { label: 'Lunch', isDefault: true, orderIndex: 1 },
            { label: 'Dinner', isDefault: true, orderIndex: 2 },
          ],
        },
      },
      include: {
        slots: { orderBy: { orderIndex: 'asc' } },
        members: true,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  }
  catch (err) {
    console.error('[POST /api/meal-plans]', err);
    return NextResponse.json({ error: 'Failed to create meal plan' }, { status: 500 });
  }
};
