import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const POST = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.recipeBookMember.findUnique({
    where: { recipeBookId_userId: { recipeBookId: id, userId: session.user.id } },
  });
  if (!member || member.acceptedAt !== null) {
    return NextResponse.json({ error: 'No pending invite' }, { status: 404 });
  }

  const updated = await prisma.recipeBookMember.update({
    where: { id: member.id },
    data: { acceptedAt: new Date() },
  });

  return NextResponse.json(updated);
};
