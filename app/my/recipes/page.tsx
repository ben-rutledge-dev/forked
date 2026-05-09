import type { Metadata } from 'next';
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

const MyRecipesPage = async () => {
  const session = await auth();
  const userId = session!.user.id;

  const [recipes, members] = await Promise.all([
    prisma.recipe.findMany({
      where: { authorId: userId },
      select: { id: true, title: true, description: true, coverImageUrl: true, forkCount: true, isPublic: true, forkedFromId: true, authorId: true },
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
      recipeBook: { id: m.recipeBook.id, title: m.recipeBook.title, coverImageUrl: m.recipeBook.coverImageUrl },
      invitedByUserId: m.invitedByUserId,
    }));

  return (
    <MyRecipesClient
      initialRecipes={recipes.map(r => ({
        ...r,
        description: r.description ?? null,
        coverImageUrl: r.coverImageUrl ?? null,
        forkedFromId: r.forkedFromId ?? null,
      }))}
      initialBooks={books}
      initialPending={pending}
    />
  );
};

export default MyRecipesPage;
