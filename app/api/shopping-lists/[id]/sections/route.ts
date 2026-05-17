import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

const getAcceptedMember = async (listId: string, userId: string) => {
  const member = await prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: listId, userId } },
  });
  return member?.acceptedAt ? member : null;
};

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getAcceptedMember(id, session.user.id);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const maxSection = await prisma.shoppingListSection.findFirst({
    where: { shoppingListId: id },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });

  const section = await prisma.shoppingListSection.create({
    data: {
      shoppingListId: id,
      title: title.trim(),
      orderIndex: (maxSection?.orderIndex ?? -1) + 1,
    },
  });

  return NextResponse.json(section, { status: 201 });
};
