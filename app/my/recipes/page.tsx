import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyRecipesClient } from "./components/MyRecipesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Recipes" };

export default async function MyRecipesPage() {
  const session = await auth();
  const recipes = await prisma.recipe.findMany({
    where: { authorId: session!.user.id },
    select: {
      id: true,
      title: true,
      description: true,
      coverImageUrl: true,
      forkCount: true,
      isPublic: true,
      forkedFromId: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <MyRecipesClient
      initialRecipes={recipes.map((r) => ({
        ...r,
        description: r.description ?? null,
        coverImageUrl: r.coverImageUrl ?? null,
        forkedFromId: r.forkedFromId ?? null,
      }))}
    />
  );
}
