import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query as { id: string };

  const original = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { orderIndex: "asc" } },
      steps: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!original) return res.status(404).json({ error: "Recipe not found" });
  if (!original.isPublic) return res.status(403).json({ error: "Recipe is not public" });

  const [fork] = await prisma.$transaction([
    prisma.recipe.create({
      data: {
        title: original.title,
        description: original.description,
        authorId: session.user.id,
        isPublic: false,
        forkedFromId: original.id,
        ingredients: {
          create: original.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            orderIndex: ing.orderIndex,
          })),
        },
        steps: {
          create: original.steps.map((step) => ({
            instruction: step.instruction,
            imageUrl: step.imageUrl,
            timerSeconds: step.timerSeconds,
            orderIndex: step.orderIndex,
          })),
        },
      },
    }),
    prisma.recipe.update({
      where: { id },
      data: { forkCount: { increment: 1 } },
    }),
  ]);

  return res.status(201).json(fork);
}
