import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string, userId: string }> };

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id, userId: targetUserId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const remover = await prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: id, userId: session.user.id } },
  });
  if (!remover?.acceptedAt || remover.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const target = await prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: id, userId: targetUserId } },
  });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.role === 'OWNER') {
    return NextResponse.json({ error: 'Cannot remove another owner' }, { status: 403 });
  }

  await prisma.shoppingListMember.delete({ where: { id: target.id } });
  return new Response(null, { status: 204 });
};
