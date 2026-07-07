import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const POST = async (_req: Request, { params }: Params) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: recipeId } = await params;

  const recipeExists = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } });
  if (!recipeExists) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

  try {
    const lastFavourite = await prisma.recipeFavourite.findFirst({
      where: { userId: session.user.id },
      orderBy: { orderIndex: 'desc' },
    });

    await prisma.recipeFavourite.create({
      data: { userId: session.user.id, recipeId, orderIndex: (lastFavourite?.orderIndex ?? -1) + 1 },
    });
  }
  catch (err) {
    // P2002 = unique constraint violation — already favourited, treat as success
    if ((err as { code?: string }).code !== 'P2002') throw err;
  }

  return NextResponse.json({ favourited: true });
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: recipeId } = await params;

  const recipeExists = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } });
  if (!recipeExists) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

  await prisma.recipeFavourite.deleteMany({
    where: { userId: session.user.id, recipeId },
  });

  return NextResponse.json({ favourited: false });
};
