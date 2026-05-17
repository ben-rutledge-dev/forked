import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string, itemId: string }> };

const getAcceptedMember = async (listId: string, userId: string) => {
  const member = await prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: listId, userId } },
  });
  return member?.acceptedAt ? member : null;
};

export const PUT = async (req: Request, { params }: Params) => {
  const { id, itemId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getAcceptedMember(id, session.user.id);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, checked, sectionId, orderIndex } = await req.json();
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (checked !== undefined) data.checked = checked;
  if (sectionId !== undefined) data.sectionId = sectionId;
  if (orderIndex !== undefined) data.orderIndex = orderIndex;

  try {
    const updated = await prisma.shoppingListItem.update({
      where: { id: itemId, shoppingListId: id },
      data,
    });
    return NextResponse.json(updated);
  }
  catch {
    // Item may have been deleted by another client
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id, itemId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getAcceptedMember(id, session.user.id);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await prisma.shoppingListItem.delete({ where: { id: itemId, shoppingListId: id } });
  }
  catch {
    // Already deleted by another client — treat as success
  }

  return new Response(null, { status: 204 });
};
