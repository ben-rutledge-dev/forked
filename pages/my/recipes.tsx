import Layout from "@/components/Layout";
import RecipeCard from "@/components/RecipeCard";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { useState } from "react";
import Link from "next/link";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  forkCount: number;
  isPublic: boolean;
  forkedFromId: string | null;
};

type Props = { recipes: Recipe[] };

export default function MyRecipes({ recipes: initial }: Props) {
  const [recipes, setRecipes] = useState(initial);

  function handleVisibilityToggle(id: string, isPublic: boolean) {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, isPublic } : r)));
  }

  return (
    <Layout title="My Recipes">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">My Recipes</h1>
          <Link
            href="/my/recipes/new"
            className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            + New recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p>No recipes yet.</p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <Link href="/my/recipes/new" className="text-stone-700 underline hover:text-stone-900">
                Create one
              </Link>
              <span className="text-stone-300">or</span>
              <Link href="/pool" className="text-stone-700 underline hover:text-stone-900">
                fork from the pool
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                id={r.id}
                title={r.title}
                description={r.description}
                coverImageUrl={r.coverImageUrl}
                forkCount={r.forkCount}
                isPublic={r.isPublic}
                isOwned
                forkedFromId={r.forkedFromId}
                onVisibilityToggle={handleVisibilityToggle}
              />
            ))}
          </div>
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

  const recipes = await prisma.recipe.findMany({
    where: { authorId: session.user.id },
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

  return {
    props: {
      recipes: recipes.map((r) => ({
        ...r,
        description: r.description ?? null,
        coverImageUrl: r.coverImageUrl ?? null,
        forkedFromId: r.forkedFromId ?? null,
      })),
    },
  };
};
