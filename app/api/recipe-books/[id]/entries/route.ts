import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

const getAcceptedMember = async (bookId: string, userId: string) => {
  const m = await prisma.recipeBookMember.findUnique({
    where: { recipeBookId_userId: { recipeBookId: bookId, userId } },
  });
  return m?.acceptedAt ? m : null;
};

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getAcceptedMember(id, session.user.id);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { recipeId } = await req.json();
  if (!recipeId) return NextResponse.json({ error: 'recipeId required' }, { status: 400 });

  const existing = await prisma.recipeBookEntry.findUnique({
    where: { recipeBookId_recipeId: { recipeBookId: id, recipeId } },
  });
  if (existing) return NextResponse.json({ error: 'Already in book' }, { status: 409 });

  const maxEntry = await prisma.recipeBookEntry.findFirst({
    where: { recipeBookId: id },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });

  const entry = await prisma.recipeBookEntry.create({
    data: {
      recipeBookId: id,
      recipeId,
      addedByUserId: session.user.id,
      orderIndex: (maxEntry?.orderIndex ?? -1) + 1,
    },
  });

  return NextResponse.json(entry, { status: 201 });
};
