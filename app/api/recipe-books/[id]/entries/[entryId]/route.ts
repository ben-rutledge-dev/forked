import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string; entryId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { id, entryId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.recipeBookMember.findUnique({
    where: { recipeBookId_userId: { recipeBookId: id, userId: session.user.id } },
  });
  if (!member?.acceptedAt) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const entry = await prisma.recipeBookEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.recipeBookId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.recipeBookEntry.delete({ where: { id: entryId } });
  return new Response(null, { status: 204 });
}
