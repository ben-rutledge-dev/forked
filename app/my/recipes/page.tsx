import type { Metadata } from 'next';
import { Suspense } from 'react';
// Data
import type { BookWithStats, PendingInvite } from '@/data/recipe-books/types';
// Components
import { MyRecipesClient } from './components/MyRecipesClient';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// Utils
import { type Role } from '@/utils/roles';

export const metadata: Metadata = { title: 'My Recipes' };

const MyRecipesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string, categories?: string, tab?: string }>
}) => {
  const session = await auth();
  const userId = session!.user.id;
  const { tags: tagsParam = '', categories: categoriesParam = '' } = await searchParams;
  const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : [];
  const categorySlugs = categoriesParam ? categoriesParam.split(',').map(s => s.trim()).filter(Boolean) : [];

  const [allRecipes, filteredRecipes, members, favouriteRecords] = await Promise.all([
    // Full unfiltered set — lightweight, only what's needed to build filter options
    prisma.recipe.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        tags: true,
        categories: {
          select: {
            category: {
              select: { slug: true, label: true, group: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    // Filtered set for initial display
    prisma.recipe.findMany({
      where: {
        authorId: userId,
        ...(tags.length > 0 && { tags: { hasSome: tags } }),
        ...(categorySlugs.length > 0 && {
          categories: { some: { category: { slug: { in: categorySlugs } } } },
        }),
      },
      select: {
        id: true, title: true, description: true, coverImageUrl: true, forkCount: true,
        isPublic: true, forkedFromId: true, authorId: true, tags: true,
        categories: {
          select: {
            category: { select: { id: true, slug: true, label: true, group: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.recipeBookMember.findMany({
      where: { userId },
      include: {
        recipeBook: {
          include: {
            members: { where: { acceptedAt: { not: null } } },
            entries: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.recipeFavourite.findMany({
      where: { userId },
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
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const books: BookWithStats[] = members
    .filter(m => m.acceptedAt !== null)
    .map(m => ({
      id: m.recipeBook.id,
      title: m.recipeBook.title,
      description: m.recipeBook.description,
      coverImageUrl: m.recipeBook.coverImageUrl,
      isPublic: m.recipeBook.isPublic,
      createdAt: m.recipeBook.createdAt.toISOString(),
      updatedAt: m.recipeBook.updatedAt.toISOString(),
      role: m.role as Role,
      memberCount: m.recipeBook.members.length,
      recipeCount: m.recipeBook.entries.length,
    }));

  const pending: PendingInvite[] = members
    .filter(m => m.acceptedAt === null)
    .map(m => ({
      id: m.id,
      role: m.role as Role,
      createdAt: m.createdAt.toISOString(),
      recipeBook: {
        id: m.recipeBook.id,
        title: m.recipeBook.title,
        coverImageUrl: m.recipeBook.coverImageUrl,
      },
      invitedByUserId: m.invitedByUserId,
    }));

  return (
    <Suspense>
      <MyRecipesClient
        initialRecipes={filteredRecipes.map(({ categories, ...r }) => ({
          ...r,
          description: r.description ?? null,
          coverImageUrl: r.coverImageUrl ?? null,
          forkedFromId: r.forkedFromId ?? null,
          categories: categories.map(rc => rc.category),
        }))}
        allRecipes={allRecipes.map(({ categories, ...r }) => ({
          ...r,
          categories: categories.map(rc => rc.category),
        }))}
        initialBooks={books}
        initialPending={pending}
        initialTagFilter={tags}
        initialCategories={categorySlugs}
        initialFavourites={favouriteRecords.map(({ recipe: { categories, ...r } }) => ({
          ...r,
          description: r.description ?? null,
          coverImageUrl: r.coverImageUrl ?? null,
          forkedFromId: r.forkedFromId ?? null,
          categories: categories.map(rc => rc.category),
        }))}
      />
    </Suspense>
  );
};

export default MyRecipesPage;
