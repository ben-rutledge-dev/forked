import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
// Components
import { RecipeBookDetailClient } from './components/RecipeBookDetailClient';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// Utils
import { type Role } from '@/utils/roles';

type Props = { params: Promise<{ id: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { id } = await params;
  const book = await prisma.recipeBook.findUnique({ where: { id }, select: { title: true } });
  return { title: book?.title ?? 'Recipe Book' };
};

const RecipeBookDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;

  const [book, user, userRecipes] = await Promise.all([
    prisma.recipeBook.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        entries: {
          include: {
            recipe: {
              select: {
                id: true, title: true, description: true, coverImageUrl: true,
                forkCount: true, isPublic: true, authorId: true, forkedFromId: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } }),
    prisma.recipe.findMany({
      where: { authorId: userId },
      select: { id: true, title: true, coverImageUrl: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  if (!book) notFound();

  const member = book.members.find(m => m.userId === userId);
  const isAccepted = member?.acceptedAt !== null && member !== undefined;

  if (!isAccepted) {
    // If there's a pending invite, redirect to list page where they can accept
    if (member) redirect('/my/recipe-books');
    notFound();
  }

  const currentUserRole = member!.role as Role;

  const bookData = {
    id: book.id,
    title: book.title,
    description: book.description,
    coverImageUrl: book.coverImageUrl,
    isPublic: book.isPublic,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    currentUserRole,
    entries: book.entries.map(e => ({
      id: e.id,
      recipeBookId: e.recipeBookId,
      recipeId: e.recipeId,
      addedByUserId: e.addedByUserId,
      orderIndex: e.orderIndex,
      createdAt: e.createdAt.toISOString(),
      recipe: {
        id: e.recipe.id,
        title: e.recipe.title,
        description: e.recipe.description,
        coverImageUrl: e.recipe.coverImageUrl,
        forkCount: e.recipe.forkCount,
        isPublic: e.recipe.isPublic,
        authorId: e.recipe.authorId,
      },
    })),
    members: book.members.map(m => ({
      id: m.id,
      recipeBookId: m.recipeBookId,
      userId: m.userId,
      role: m.role as Role,
      acceptedAt: m.acceptedAt?.toISOString() ?? null,
      invitedByUserId: m.invitedByUserId,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    })),
  };

  return (
    <RecipeBookDetailClient
      book={bookData}
      currentUserId={userId}
      isPremium={user?.isPremium ?? false}
      userRecipes={userRecipes.map(r => ({ id: r.id, title: r.title, coverImageUrl: r.coverImageUrl }))}
    />
  );
};

export default RecipeBookDetailPage;
