import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const favourites = await prisma.recipeFavourite.findMany({
    where: { userId: session.user.id },
    include: {
      recipe: {
        select: {
          id: true,
          title: true,
          description: true,
          coverImageUrl: true,
          forkCount: true,
          isPublic: true,
          forkedFromId: true,
          authorId: true,
          tags: true,
          categories: {
            select: {
              category: { select: { id: true, slug: true, label: true, group: true } },
            },
          },
        },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  return NextResponse.json(
    favourites.map(({ recipe: { categories, ...r }, orderIndex }) => ({
      ...r,
      orderIndex,
      categories: categories.map(rc => rc.category),
    })),
  );
};
