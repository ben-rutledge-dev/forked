import { prisma } from "@/lib/prisma";
import { PoolClient } from "./components/PoolClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recipe Pool" };

const PAGE_SIZE = 24;

export default async function PoolPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr));
  const skip = (page - 1) * PAGE_SIZE;

  const where = q
    ? {
        isPublic: true,
        OR: [
          { title: { contains: q } },
          { ingredients: { some: { name: { contains: q } } } },
        ],
      }
    : { isPublic: true };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      select: { id: true, title: true, description: true, coverImageUrl: true, forkCount: true, authorId: true, isPublic: true, forkedFromId: true },
      orderBy: { forkCount: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.recipe.count({ where }),
  ]);

  return (
    <PoolClient
      initialRecipes={recipes}
      initialTotal={total}
      initialPage={page}
      initialQuery={q}
    />
  );
}
