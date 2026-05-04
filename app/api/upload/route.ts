import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, ext } = await req.json();
  if (!data || !ext) return NextResponse.json({ error: "Missing data or ext" }, { status: 400 });

  const cleanExt = String(ext).toLowerCase().replace(/[^a-z]/g, "");
  if (!ALLOWED_EXTS.includes(cleanExt)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}.${cleanExt}`;
  await writeFile(path.join(uploadsDir, filename), Buffer.from(String(data), "base64"));

  return NextResponse.json({ url: `/uploads/${filename}` });
}
