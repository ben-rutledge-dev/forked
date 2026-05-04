import Layout from "@/components/Layout";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RecipeWithRelations } from "@/types";
import { RecipeDetail } from "@/components/RecipeDetail";

type Props = { recipe: RecipeWithRelations };

export default function MyRecipePage({ recipe }: Props) {
  return (
    <Layout title={recipe.title}>
      <RecipeDetail
        recipe={recipe}
        cookHref={`/my/recipes/${recipe.id}/cook`}
        cookVariant="primary"
        headerAction={
          <Link
            href={`/my/recipes/${recipe.id}/edit`}
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
    </Layout>
  );
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
      forkedFrom: { select: { id: true, title: true, isPublic: true } },
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!recipe) return { notFound: true };
  return { props: { recipe: JSON.parse(JSON.stringify(recipe)) } };
};
