import { NextResponse } from 'next/server';
// Data
import { postSectionSchema } from '@/data/shopping-lists/[shoppingListId]/sections/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
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

  const parsed = await parseBody(req, postSectionSchema);
  if (!parsed.success) return parsed.response;
  const { title } = parsed.data;

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
