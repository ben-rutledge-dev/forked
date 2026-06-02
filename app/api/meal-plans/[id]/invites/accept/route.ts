import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const POST = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
  });
  if (!member || member.acceptedAt) return NextResponse.json({ error: 'No pending invite' }, { status: 404 });

  const updated = await prisma.mealPlanMember.update({
    where: { id: member.id },
    data: { acceptedAt: new Date() },
  });

  return NextResponse.json({ ...updated, acceptedAt: updated.acceptedAt?.toISOString(), createdAt: updated.createdAt.toISOString() });
};
