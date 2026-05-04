import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CookMode from "@/components/CookMode";

type Props = { params: Promise<{ id: string }> };

export default async function MyCookPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id, authorId: session!.user.id },
    include: {
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!recipe) notFound();

  return (
    <CookMode
      recipe={JSON.parse(JSON.stringify(recipe))}
      backHref={`/my/recipes/${id}/edit`}
    />
  );
}
