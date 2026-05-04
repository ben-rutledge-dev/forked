import Layout from "@/components/Layout";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { RecipeWithRelations } from "@/types";
import { ForkIcon } from "@/components/ForkIcon";
import { Button } from "@/components/ui/Button";
import { RecipeDetail } from "@/components/RecipeDetail";

type Props = { recipe: RecipeWithRelations };

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
      <RecipeDetail
        recipe={recipe}
        cookHref={`/recipes/${recipe.id}/cook`}
        headerAction={
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
        }
        metaBadge={
          <span>
            forked by {recipe.forkCount} {recipe.forkCount === 1 ? "cook" : "cooks"}
          </span>
        }
      />
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
  return { props: { recipe: JSON.parse(JSON.stringify(recipe)) } };
};
