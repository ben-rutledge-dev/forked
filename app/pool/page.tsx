import type { Metadata } from 'next';
import { Suspense } from 'react';
// Components
import { PoolClient } from './components/PoolClient';
import { PageLayout } from '@/components/PageLayout';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Recipe Pool' };

const PAGE_SIZE = 24;

const PoolPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, page?: string, categories?: string }>
}) => {
  const { q = '', page: pageStr = '1', categories: categoriesParam = '' } = await searchParams;
  const page = Math.max(1, Number(pageStr));
  const skip = (page - 1) * PAGE_SIZE;
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
          category: { slug: { in: categorySlugs } },
        },
      },
    }),
  };

  const session = await auth();
  const userId = session?.user?.id;

  const [recipes, total, allCategories, favourites] = await Promise.all([
    prisma.recipe.findMany({
      where,
      select: { id: true, title: true, description: true, coverImageUrl: true, forkCount: true, authorId: true, isPublic: true, forkedFromId: true, tags: true },
      orderBy: { forkCount: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.recipe.count({ where }),
    prisma.category.findMany({
      select: { id: true, slug: true, label: true, group: true },
      orderBy: { label: 'asc' },
    }),
    userId
      ? prisma.recipeFavourite.findMany({
          where: { userId },
          select: { recipeId: true },
        })
      : Promise.resolve([]),
  ]);

  const favouritedIds = favourites.map((f: { recipeId: string }) => f.recipeId);

  return (
    <PageLayout>
      <Suspense>
        <PoolClient
          initialRecipes={recipes}
          initialTotal={total}
          initialPage={page}
          initialQuery={q}
          initialCategories={categorySlugs}
          allCategories={allCategories}
          initialFavourites={favouritedIds}
        />
      </Suspense>
    </PageLayout>
  );
};

export default PoolPage;
