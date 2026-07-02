import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const members = await prisma.mealPlanMember.findMany({
    where: { userId, acceptedAt: null },
    include: {
      mealPlan: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const pending = members.map(m => ({
    id: m.id,
    mealPlanId: m.mealPlanId,
    role: m.role,
    createdAt: m.createdAt.toISOString(),
    mealPlan: { id: m.mealPlan.id, title: m.mealPlan.title },
    invitedByUserId: m.invitedByUserId,
  }));

  return NextResponse.json({ pending });
};
