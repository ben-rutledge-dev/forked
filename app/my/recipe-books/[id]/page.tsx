import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { type Role } from "@/utils/roles";
import { RecipeBookDetailClient } from "./components/RecipeBookDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = await prisma.recipeBook.findUnique({ where: { id }, select: { title: true } });
  return { title: book?.title ?? "Recipe Book" };
}

export default async function RecipeBookDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  const [book, user, userRecipes] = await Promise.all([
    prisma.recipeBook.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
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
          orderBy: { orderIndex: "asc" },
        },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } }),
    prisma.recipe.findMany({
      where: { authorId: userId },
      select: { id: true, title: true, coverImageUrl: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!book) notFound();

  const member = book.members.find((m) => m.userId === userId);
  const isAccepted = member?.acceptedAt !== null && member !== undefined;

  if (!isAccepted) {
    // If there's a pending invite, redirect to list page where they can accept
    if (member) redirect("/my/recipe-books");
    notFound();
  }

  const currentUserRole = member!.role as Role;

  const bookData = {
    id: book.id,
    title: book.title,
    description: book.description,
    coverImageUrl: book.coverImageUrl,
    isPublic: book.isPublic,
    currentUserRole,
    entries: book.entries.map((e) => ({
      id: e.id,
      orderIndex: e.orderIndex,
      recipe: {
        id: e.recipe.id,
        title: e.recipe.title,
        description: e.recipe.description,
        coverImageUrl: e.recipe.coverImageUrl,
        forkCount: e.recipe.forkCount,
        isPublic: e.recipe.isPublic,
        authorId: e.recipe.authorId,
        forkedFromId: e.recipe.forkedFromId,
      },
    })),
    members: book.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role as Role,
      acceptedAt: m.acceptedAt?.toISOString() ?? null,
      user: m.user,
    })),
  };

  return (
    <RecipeBookDetailClient
      book={bookData}
      currentUserId={userId}
      isPremium={user?.isPremium ?? false}
      userRecipes={userRecipes.map((r) => ({ id: r.id, title: r.title, coverImageUrl: r.coverImageUrl }))}
    />
  );
}
