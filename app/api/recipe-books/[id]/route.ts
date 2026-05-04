import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

async function getMember(bookId: string, userId: string) {
  return prisma.recipeBookMember.findUnique({
    where: { recipeBookId_userId: { recipeBookId: bookId, userId } },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  const book = await prisma.recipeBook.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
      entries: {
        include: {
          recipe: {
            select: {
              id: true, title: true, description: true, coverImageUrl: true,
              forkCount: true, isPublic: true, authorId: true,
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = session?.user?.id
    ? book.members.find((m) => m.userId === session.user!.id)
    : null;

  const isAcceptedMember = member?.acceptedAt !== null && member !== null;

  if (!book.isPublic && !isAcceptedMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // For public view, filter out private recipes
  const filteredEntries = book.entries.map((e) => ({
    ...e,
    recipe: isAcceptedMember || e.recipe.isPublic ? e.recipe : null,
  })).filter((e) => e.recipe !== null);

  return NextResponse.json({ ...book, entries: filteredEntries, currentUserRole: member?.role ?? null });
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await getMember(id, session.user.id);
  if (!member?.acceptedAt || member.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, isPublic, coverImageUrl } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const updated = await prisma.recipeBook.update({
    where: { id },
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      isPublic: Boolean(isPublic),
      coverImageUrl: coverImageUrl || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await getMember(id, session.user.id);
  if (!member?.acceptedAt || member.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Remove current user's membership
  await prisma.recipeBookMember.delete({ where: { id: member.id } });

  // Count remaining owners
  const remainingOwners = await prisma.recipeBookMember.count({
    where: { recipeBookId: id, role: "OWNER", acceptedAt: { not: null } },
  });

  if (remainingOwners === 0) {
    // Hard delete
    await prisma.recipeBookEntry.deleteMany({ where: { recipeBookId: id } });
    await prisma.recipeBookMember.deleteMany({ where: { recipeBookId: id } });
    await prisma.recipeBook.delete({ where: { id } });
  }

  return new Response(null, { status: 204 });
}
