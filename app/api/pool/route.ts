import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PAGE_SIZE = 24;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
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
      select: { id: true, title: true, description: true, coverImageUrl: true, forkCount: true },
      orderBy: { forkCount: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.recipe.count({ where }),
  ]);

  return NextResponse.json({ recipes, total });
}
