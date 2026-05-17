import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const POST = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: id, userId: session.user.id } },
  });
  if (!member || member.acceptedAt !== null) {
    return NextResponse.json({ error: 'No pending invite' }, { status: 404 });
  }

  await prisma.shoppingListMember.delete({ where: { id: member.id } });

  return new Response(null, { status: 204 });
};
