import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const ALLOWED_STRING_FIELDS = [
  "username",
  "bio",
  "avatarUrl",
  "coverImageUrl",
  "websiteUrl",
  "twitterHandle",
  "instagramHandle",
  "youtubeUrl",
] as const;

type StringField = (typeof ALLOWED_STRING_FIELDS)[number];

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const stringData: Partial<Record<StringField, string | null>> = {};
  let isPublic: boolean | undefined;

  for (const field of ALLOWED_STRING_FIELDS) {
    if (field in body) {
      stringData[field] = body[field] === null ? null : String(body[field]);
    }
  }
  if ("isPublic" in body) {
    isPublic = Boolean(body.isPublic);
  }

  // Validate username: alphanumeric + underscores only, 3–30 chars
  if (typeof stringData.username === "string") {
    const clean = stringData.username.trim();
    if (clean.length > 0 && !/^[a-zA-Z0-9_]{3,30}$/.test(clean)) {
      return Response.json(
        { error: "Username must be 3–30 characters and contain only letters, numbers, or underscores." },
        { status: 422 }
      );
    }
    stringData.username = clean || null;
  }

  // Basic URL validation for link fields
  const urlFields: StringField[] = ["websiteUrl", "youtubeUrl"];
  for (const field of urlFields) {
    if (stringData[field]) {
      try {
        new URL(stringData[field] as string);
      } catch {
        return Response.json({ error: `Invalid URL for ${field}` }, { status: 422 });
      }
    }
  }

  const data = { ...stringData, ...(isPublic !== undefined ? { isPublic } : {}) };

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPublic: true,
        username: true,
        bio: true,
        avatarUrl: true,
        coverImageUrl: true,
        websiteUrl: true,
        twitterHandle: true,
        instagramHandle: true,
        youtubeUrl: true,
      },
    });
    return Response.json(user);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
      return Response.json({ error: "That username is already taken." }, { status: 409 });
    }
    throw e;
  }
}
