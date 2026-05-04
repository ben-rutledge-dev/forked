import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query as { id: string };
  const { isPublic } = req.body;

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) return res.status(404).json({ error: "Not found" });
  if (recipe.authorId !== session.user.id) return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.recipe.update({
    where: { id },
    data: { isPublic: Boolean(isPublic) },
  });

  return res.json(updated);
}
