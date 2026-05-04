import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.recipeBookMember.findUnique({
    where: { recipeBookId_userId: { recipeBookId: id, userId: session.user.id } },
  });
  if (!member || member.acceptedAt !== null) {
    return NextResponse.json({ error: "No pending invite" }, { status: 404 });
  }

  await prisma.recipeBookMember.delete({ where: { id: member.id } });
  return new Response(null, { status: 204 });
}
