import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import CookMode from "@/components/CookMode";
import { RecipeWithRelations } from "@/types";

type Props = { recipe: RecipeWithRelations };

export default function PublicCookPage({ recipe }: Props) {
  return <CookMode recipe={recipe} backHref={`/recipe/${recipe.id}`} />;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublic: true },
    include: {
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!recipe) return { notFound: true };
  return { props: { recipe: JSON.parse(JSON.stringify(recipe)) } };
};
