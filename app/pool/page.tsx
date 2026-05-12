import type { Metadata } from 'next';
import { Suspense } from 'react';
// Components
import { PoolClient } from './components/PoolClient';
// Lib
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

  const [recipes, total, allCategories] = await Promise.all([
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
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Suspense>
        <PoolClient
          initialRecipes={recipes}
          initialTotal={total}
          initialPage={page}
          initialQuery={q}
          initialCategories={categorySlugs}
          allCategories={allCategories}
        />
      </Suspense>
    </div>
  );
};

export default PoolPage;
