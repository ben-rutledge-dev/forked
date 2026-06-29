import { cache } from 'react';
// Lib
import { prisma } from '@/lib/prisma';

/**
 * React.cache deduplicates calls with identical arguments within the same server request,
 * so multiple sections fetching the same data only run one Prisma query.
 */

export const getMembership = cache(async (userId: string) =>
  prisma.mealPlanMember.findFirst({
    where: { userId, acceptedAt: { not: null } },
    orderBy: { createdAt: 'asc' },
  }),
);

export const getIsPremium = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } });
  return user?.isPremium ?? false;
});

export const getMealPlanEntries = cache(async (mealPlanId: string, fromStr: string, toStr: string) =>
  prisma.mealPlanEntry.findMany({
    where: { mealPlanId, date: { gte: new Date(fromStr), lte: new Date(toStr) } },
    include: { recipe: { select: { id: true, title: true, coverImageUrl: true, tags: true, categories: { include: { category: { select: { label: true } } } } } }, slot: { select: { label: true } } },
    orderBy: [{ slot: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
  }),
);

export const getUserRecipes = cache(async (userId: string) =>
  prisma.recipe.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: { id: true, title: true, description: true, coverImageUrl: true, authorId: true, isPublic: true, forkedFromId: true, forkCount: true, tags: true, categories: { include: { category: { select: { label: true } } } }, createdAt: true, updatedAt: true },
  }),
);

export const getUserShoppingLists = cache(async (userId: string) =>
  prisma.shoppingListMember.findMany({
    where: { userId, acceptedAt: { not: null } },
    include: {
      shoppingList: {
        include: {
          members: { where: { acceptedAt: { not: null } } },
          items: { select: { checked: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  }),
);

export const getSuggestionDismissals = cache(async (userId: string) =>
  prisma.mealPlanSuggestionDismissal.findMany({
    where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { ingredientName: true },
  }),
);

export const getSuggestionEntries = cache(async (mealPlanId: string, fromStr: string, toStr: string) =>
  prisma.mealPlanEntry.findMany({
    where: { mealPlanId, date: { gte: new Date(fromStr), lte: new Date(toStr) }, recipeId: { not: null } },
    include: { recipe: { include: { ingredients: { select: { name: true } } } } },
  }),
);
