import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CookMode from "@/components/CookMode";
import { RecipeWithRelations } from "@/types";

type Props = { recipe: RecipeWithRelations };

export default function MyCookPage({ recipe }: Props) {
  return <CookMode recipe={recipe} backHref={`/my/recipes/${recipe.id}/edit`} />;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user?.id) {
    return { redirect: { destination: "/api/auth/signin", permanent: false } };
  }

  const id = ctx.params?.id as string;
  const recipe = await prisma.recipe.findUnique({
    where: { id, authorId: session.user.id },
    include: {
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!recipe) return { notFound: true };
  return { props: { recipe: JSON.parse(JSON.stringify(recipe)) } };
};
