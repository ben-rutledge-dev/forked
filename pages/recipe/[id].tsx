import { Layout } from "@/components/Layout";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Link from "next/link";
import { RecipeWithRelations } from "@/types";
import { ForkIcon } from "@/components/ForkIcon";
import { Button } from "@/components/Button";

type Props = {
  recipe: RecipeWithRelations;
};

export default function RecipePage({ recipe }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [forking, setForking] = useState(false);
  const [iconAnimating, setIconAnimating] = useState(false);
  const pendingForkId = useRef<string | null>(null);

  async function handleFork() {
    if (!session) {
      signIn();
      return;
    }
    setForking(true);
    setIconAnimating(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/fork`, { method: "POST" });
      if (res.ok) {
        const fork = await res.json();
        pendingForkId.current = fork.id;
      }
    } finally {
      setForking(false);
    }
  }

  function handleAnimationDone() {
    setIconAnimating(false);
    if (pendingForkId.current) {
      router.push(`/my/recipes/${pendingForkId.current}/edit`);
      pendingForkId.current = null;
    }
  }

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
            <Button
              variant="primary"
              size="lg"
              shape="pill"
              onClick={handleFork}
              disabled={forking}
              className="shrink-0 flex items-center gap-2"
            >
              {forking ? "Forking…" : "Fork"}
              <ForkIcon animating={iconAnimating} onDone={handleAnimationDone} />
            </Button>
          </div>

          {recipe.description && (
            <p className="mt-3 text-stone-600 leading-relaxed">{recipe.description}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-stone-400">
            <span>
              forked by {recipe.forkCount} {recipe.forkCount === 1 ? "cook" : "cooks"}
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
              href={`/recipe/${recipe.id}/cook`}
              className="ml-auto rounded-full border border-stone-300 px-4 py-1.5 text-stone-600 hover:bg-stone-100 transition-colors"
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
          <section className="mb-10">
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

        {(recipe.forks?.length ?? 0) > 0 && (
          <section className="border-t border-stone-200 pt-8">
            <h2 className="font-medium text-stone-900 mb-4">Public forks</h2>
            <ul className="space-y-3">
              {recipe.forks!.map((fork) => (
                <li key={fork.id}>
                  <Link
                    href={`/recipe/${fork.id}`}
                    className="block rounded-lg border border-stone-200 p-4 hover:border-stone-300 transition-colors"
                  >
                    <p className="font-medium text-stone-900">{fork.title}</p>
                    {fork.description && (
                      <p className="mt-1 text-sm text-stone-500 line-clamp-1">{fork.description}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublic: true },
    include: {
      author: { select: { id: true, name: true, isPublic: true } },
      forkedFrom: { select: { id: true, title: true, isPublic: true } },
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
      forks: {
        where: { isPublic: true },
        select: {
          id: true,
          title: true,
          description: true,
          author: { select: { name: true, isPublic: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!recipe) return { notFound: true };

  return {
    props: {
      recipe: JSON.parse(JSON.stringify(recipe)),
    },
  };
};
