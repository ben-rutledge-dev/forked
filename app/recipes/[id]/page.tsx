import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/RecipeDetail";
import { ForkButton } from "./ForkButton";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublic: true },
    select: { title: true },
  });
  return { title: recipe?.title ?? "Recipe" };
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublic: true },
    include: {
      author: { select: { id: true, name: true, username: true, isPublic: true } },
      forkedFrom: { select: { id: true, title: true, isPublic: true } },
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
      forks: {
        where: { isPublic: true },
        select: {
          id: true,
          title: true,
          description: true,
          author: { select: { name: true, username: true, isPublic: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!recipe) notFound();

  return (
    <RecipeDetail
      recipe={JSON.parse(JSON.stringify(recipe))}
      cookHref={`/recipes/${id}/cook`}
      headerAction={<ForkButton recipeId={id} />}
      metaBadge={
        <span>
          forked by {recipe.forkCount} {recipe.forkCount === 1 ? "cook" : "cooks"}
        </span>
      }
    />
  );
}
