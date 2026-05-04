import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CookMode from "@/components/CookMode";

type Props = { params: Promise<{ id: string }> };

export default async function PublicCookPage({ params }: Props) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublic: true },
    include: {
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!recipe) notFound();

  return (
    <CookMode
      recipe={JSON.parse(JSON.stringify(recipe))}
      backHref={`/recipes/${id}`}
    />
  );
}
