import { NextResponse } from 'next/server';
// Lib
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 24;

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const skip = (page - 1) * PAGE_SIZE;
  const categoriesParam = searchParams.get('categories') ?? '';
  const categorySlugs = categoriesParam ? categoriesParam.split(',').map(s => s.trim()).filter(Boolean) : [];

  const where = {
    isPublic: true,
    ...(q && {
      OR: [
        { title: { contains: q } },
        { ingredients: { some: { name: { contains: q } } } },
      ],
    }),
    ...(categorySlugs.length > 0 && {
      categories: {
        some: {
          category: {
            slug: { in: categorySlugs },
          },
        },
      },
    }),
  };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      select: { id: true, title: true, description: true, coverImageUrl: true, forkCount: true, authorId: true, isPublic: true, forkedFromId: true },
      orderBy: { forkCount: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.recipe.count({ where }),
  ]);

  return NextResponse.json({ recipes, total });
};
