import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });

  if (!user?.isPremium) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { ingredientName, permanent } = body as { ingredientName: string, permanent: boolean };

  if (!ingredientName) return NextResponse.json({ error: 'ingredientName required' }, { status: 400 });

  const expiresAt = permanent
    ? null
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.mealPlanSuggestionDismissal.upsert({
    where: { userId_ingredientName: { userId, ingredientName } },
    create: { userId, ingredientName, expiresAt },
    update: { expiresAt },
  });

  return NextResponse.json({ success: true });
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const body = await req.json();
  const { ingredientName } = body as { ingredientName: string };

  if (!ingredientName) return NextResponse.json({ error: 'ingredientName required' }, { status: 400 });

  await prisma.mealPlanSuggestionDismissal.deleteMany({
    where: { userId, ingredientName },
  });

  return NextResponse.json({ success: true });
};
