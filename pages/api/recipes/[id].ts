import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
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
    if (!recipe) return res.status(404).json({ error: "Not found" });
    return res.json(recipe);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) return res.status(404).json({ error: "Not found" });
  if (recipe.authorId !== session.user.id) return res.status(403).json({ error: "Forbidden" });

  if (req.method === "PUT") {
    const { title, description, isPublic, coverImageUrl, ingredients, steps } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Title is required" });

    await prisma.ingredient.deleteMany({ where: { recipeId: id } });
    await prisma.step.deleteMany({ where: { recipeId: id } });

    const updated = await prisma.recipe.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        coverImageUrl: coverImageUrl || null,
        isPublic: Boolean(isPublic),
        ingredients: {
          create: (ingredients ?? []).map(
            (ing: { name: string; quantity: string; unit: string }, i: number) => ({
              name: ing.name,
              quantity: ing.quantity || null,
              unit: ing.unit || null,
              orderIndex: i,
            })
          ),
        },
        steps: {
          create: (steps ?? []).map(
            (step: { instruction: string; timerSeconds: number | string; imageUrl?: string }, i: number) => ({
              instruction: step.instruction,
              timerSeconds: step.timerSeconds ? Number(step.timerSeconds) : null,
              imageUrl: step.imageUrl || null,
              orderIndex: i,
            })
          ),
        },
      },
    });
    return res.json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.recipe.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).end();
}
