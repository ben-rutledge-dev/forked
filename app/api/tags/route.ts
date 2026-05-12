import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const recipes = await prisma.recipe.findMany({
    where: { authorId: session.user.id },
    select: { tags: true },
  });

  const tags = Array.from(new Set(recipes.flatMap(r => r.tags))).sort();

  return NextResponse.json({ tags });
};
