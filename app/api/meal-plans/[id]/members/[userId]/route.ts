import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string, userId: string }> };

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id, userId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const actor = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
  });
  if (!actor?.acceptedAt || actor.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const target = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId } },
  });
  if (!target) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  if (target.role === 'OWNER') return NextResponse.json({ error: 'Cannot remove another owner' }, { status: 400 });

  await prisma.mealPlanMember.delete({ where: { id: target.id } });
  return new NextResponse(null, { status: 204 });
};
