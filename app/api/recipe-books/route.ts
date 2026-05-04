import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const members = await prisma.recipeBookMember.findMany({
    where: { userId },
    include: {
      recipeBook: {
        include: {
          members: { where: { acceptedAt: { not: null } } },
          entries: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const accepted = members
    .filter((m) => m.acceptedAt !== null)
    .map((m) => ({
      ...m.recipeBook,
      role: m.role,
      memberCount: m.recipeBook.members.length,
      recipeCount: m.recipeBook.entries.length,
    }));

  const pending = members
    .filter((m) => m.acceptedAt === null)
    .map((m) => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt,
      recipeBook: {
        id: m.recipeBook.id,
        title: m.recipeBook.title,
        coverImageUrl: m.recipeBook.coverImageUrl,
      },
      invitedByUserId: m.invitedByUserId,
    }));

  return NextResponse.json({ books: accepted, pending });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, isPublic, coverImageUrl } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const book = await prisma.recipeBook.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      isPublic: Boolean(isPublic),
      coverImageUrl: coverImageUrl || null,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
          acceptedAt: new Date(),
          invitedByUserId: session.user.id,
        },
      },
    },
  });

  return NextResponse.json(book, { status: 201 });
}
