import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string, sectionId: string }> };

const getAcceptedMember = async (listId: string, userId: string) => {
  const member = await prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: listId, userId } },
  });
  return member?.acceptedAt ? member : null;
};

export const PUT = async (req: Request, { params }: Params) => {
  const { id, sectionId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getAcceptedMember(id, session.user.id);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title, orderIndex } = await req.json();
  const data: { title?: string, orderIndex?: number } = {};
  if (title !== undefined) data.title = title.trim();
  if (orderIndex !== undefined) data.orderIndex = orderIndex;

  const updated = await prisma.shoppingListSection.update({
    where: { id: sectionId, shoppingListId: id },
    data,
  });

  return NextResponse.json(updated);
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id, sectionId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getAcceptedMember(id, session.user.id);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sectionCount = await prisma.shoppingListSection.count({ where: { shoppingListId: id } });
  if (sectionCount <= 1) {
    return NextResponse.json({ error: 'Cannot delete the last section' }, { status: 400 });
  }

  await prisma.shoppingListSection.delete({ where: { id: sectionId, shoppingListId: id } });

  return new Response(null, { status: 204 });
};
