import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyRecipesClient } from "./components/MyRecipesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Recipes" };

export default async function MyRecipesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [recipes, members] = await Promise.all([
    prisma.recipe.findMany({
      where: { authorId: userId },
      select: { id: true, title: true, description: true, coverImageUrl: true, forkCount: true, isPublic: true, forkedFromId: true },
      orderBy: { updatedAt: "desc" },
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
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const books = members
    .filter((m) => m.acceptedAt !== null)
    .map((m) => ({
      id: m.recipeBook.id,
      title: m.recipeBook.title,
      coverImageUrl: m.recipeBook.coverImageUrl,
      isPublic: m.recipeBook.isPublic,
      role: m.role as "OWNER" | "COLLABORATOR",
      memberCount: m.recipeBook.members.length,
      recipeCount: m.recipeBook.entries.length,
    }));

  const pending = members
    .filter((m) => m.acceptedAt === null)
    .map((m) => ({
      id: m.id,
      role: m.role as "OWNER" | "COLLABORATOR",
      recipeBook: { id: m.recipeBook.id, title: m.recipeBook.title, coverImageUrl: m.recipeBook.coverImageUrl },
      invitedByUserId: m.invitedByUserId,
    }));

  return (
    <MyRecipesClient
      initialRecipes={recipes.map((r) => ({
        ...r,
        description: r.description ?? null,
        coverImageUrl: r.coverImageUrl ?? null,
        forkedFromId: r.forkedFromId ?? null,
      }))}
      initialBooks={books}
      initialPending={pending}
    />
  );
}
