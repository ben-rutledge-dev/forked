import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.recipeBookMember.findUnique({
    where: { recipeBookId_userId: { recipeBookId: id, userId: session.user.id } },
  });
  if (!member?.acceptedAt) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { entries } = await req.json() as { entries: { id: string; orderIndex: number }[] };
  if (!Array.isArray(entries)) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  await prisma.$transaction(
    entries.map((e) =>
      prisma.recipeBookEntry.update({
        where: { id: e.id },
        data: { orderIndex: e.orderIndex },
      })
    )
  );

  return new Response(null, { status: 204 });
}
