import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dismissals = await prisma.mealPlanSuggestionDismissal.findMany({
    where: { userId: session.user.id, expiresAt: null },
    select: { ingredientName: true, createdAt: true },
    orderBy: { ingredientName: 'asc' },
  });

  return NextResponse.json({ dismissals });
};
