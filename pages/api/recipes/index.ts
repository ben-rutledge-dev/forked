import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, isPublic, coverImageUrl, ingredients, steps } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: "Title is required" });

  const recipe = await prisma.recipe.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      coverImageUrl: coverImageUrl || null,
      authorId: session.user.id,
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

  return res.status(201).json(recipe);
}
