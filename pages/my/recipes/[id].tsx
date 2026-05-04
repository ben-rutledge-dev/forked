import Layout from "@/components/Layout";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RecipeWithRelations } from "@/types";

type Props = { recipe: RecipeWithRelations };

export default function MyRecipePage({ recipe }: Props) {
  return (
    <Layout title={recipe.title}>
      <div className="mx-auto max-w-2xl px-4 py-10">
        {recipe.coverImageUrl && (
          <div className="mb-8 -mx-4 sm:mx-0">
            <img
              src={recipe.coverImageUrl}
              alt=""
              className="w-full h-64 object-cover sm:rounded-xl"
            />
          </div>
        )}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold text-stone-900">{recipe.title}</h1>
            <Link
              href={`/my/recipes/${recipe.id}/edit`}
              className="shrink-0 rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Edit
            </Link>
          </div>

          {recipe.description && (
            <p className="mt-3 text-stone-600 leading-relaxed">{recipe.description}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-stone-400">
            <span className={`rounded px-2 py-0.5 text-xs ${recipe.isPublic ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"}`}>
              {recipe.isPublic ? "public" : "private"}
            </span>
            {recipe.forkedFrom && (
              <span>
                fork of{" "}
                {recipe.forkedFrom.isPublic ? (
                  <Link href={`/recipe/${recipe.forkedFrom.id}`} className="underline hover:text-stone-600">
                    {recipe.forkedFrom.title}
                  </Link>
                ) : (
                  recipe.forkedFrom.title
                )}
              </span>
            )}
            <Link
              href={`/my/recipes/${recipe.id}/cook`}
              className="ml-auto rounded-full bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Cook mode
            </Link>
          </div>
        </div>

        {recipe.ingredients.length > 0 && (
          <section className="mb-8">
            <h2 className="font-medium text-stone-900 mb-3">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex gap-2 text-stone-700">
                  {(ing.quantity || ing.unit) && (
                    <span className="text-stone-400 min-w-[5rem] text-right">
                      {ing.quantity} {ing.unit}
                    </span>
                  )}
                  <span>{ing.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recipe.steps.length > 0 && (
          <section>
            <h2 className="font-medium text-stone-900 mb-4">Steps</h2>
            <ol className="space-y-6">
              {recipe.steps.map((step, i) => (
                <li key={step.id} className="flex gap-4">
                  <span className="shrink-0 flex items-start justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-500 text-sm font-medium mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-stone-700 leading-relaxed">{step.instruction}</p>
                    {step.timerSeconds && (
                      <p className="mt-1 text-sm text-stone-400">
                        Timer: {Math.floor(step.timerSeconds / 60)}m {step.timerSeconds % 60}s
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
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
