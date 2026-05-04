import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { data, ext } = req.body;
  if (!data || !ext) return res.status(400).json({ error: "Missing data or ext" });

  const cleanExt = String(ext).toLowerCase().replace(/[^a-z]/g, "");
  if (!ALLOWED_EXTS.includes(cleanExt)) {
    return res.status(400).json({ error: "Unsupported file type" });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}.${cleanExt}`;
  await writeFile(path.join(uploadsDir, filename), Buffer.from(String(data), "base64"));

  return res.json({ url: `/uploads/${filename}` });
}
