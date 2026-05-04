import Layout from "@/components/Layout";
import RecipeForm from "@/components/RecipeForm";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { RecipeWithRelations } from "@/types";

type Props = { recipe: RecipeWithRelations };

export default function EditRecipe({ recipe }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      router.push("/my/recipes");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Layout title={`Edit — ${recipe.title}`}>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">Edit recipe</h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/my/recipes/${recipe.id}/cook`}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              Cook mode
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        <RecipeForm
          recipeId={recipe.id}
          forkedFrom={recipe.forkedFrom ? {
            id: recipe.forkedFrom.id,
            title: recipe.forkedFrom.title,
            isPublic: recipe.forkedFrom.isPublic,
          } : null}
          initialData={{
            title: recipe.title,
            description: recipe.description ?? "",
            isPublic: recipe.isPublic,
            coverImageUrl: recipe.coverImageUrl ?? "",
            ingredients: recipe.ingredients.map((i) => ({
              id: i.id,
              name: i.name,
              quantity: i.quantity ?? "",
              unit: i.unit ?? "",
            })),
            steps: recipe.steps.map((s) => ({
              id: s.id,
              instruction: s.instruction,
              timerSeconds: s.timerSeconds ?? "",
              imageUrl: s.imageUrl ?? "",
            })),
          }}
        />
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
