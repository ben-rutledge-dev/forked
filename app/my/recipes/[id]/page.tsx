import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/RecipeDetail";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id }, select: { title: true } });
  return { title: recipe?.title ?? "Recipe" };
}

export default async function MyRecipePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id, authorId: session!.user.id },
    include: {
      forkedFrom: { select: { id: true, title: true, isPublic: true } },
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!recipe) notFound();

  return (
    <RecipeDetail
      recipe={JSON.parse(JSON.stringify(recipe))}
      cookHref={`/my/recipes/${id}/cook`}
      cookVariant="primary"
      headerAction={
        <Link
          href={`/my/recipes/${id}/edit`}
          className="shrink-0 rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
        >
          Edit
        </Link>
      }
      metaBadge={
        <span
          className={`rounded px-2 py-0.5 text-xs ${
            recipe.isPublic ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"
          }`}
        >
          {recipe.isPublic ? "public" : "private"}
        </span>
      }
    />
  );
}
