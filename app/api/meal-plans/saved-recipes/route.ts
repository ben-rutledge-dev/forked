import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  const recipes = await prisma.recipe.findMany({
    where: {
      OR: [
        { authorId: session.user.id },
        { favouritedBy: { some: { userId: session.user.id } } },
      ],
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      coverImageUrl: true,
    },
    orderBy: { title: 'asc' },
    take: 50,
  });

  return NextResponse.json({ recipes });
};
