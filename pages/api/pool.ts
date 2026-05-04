import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 24;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const q = String(req.query.q ?? "");
  const page = Math.max(1, Number(req.query.page ?? 1));
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

  return res.json({ recipes, total });
}
