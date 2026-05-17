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

export const PUT = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getAcceptedMember(id, session.user.id);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { sections } = await req.json() as { sections: Array<{ id: string, orderIndex: number }> };
  if (!Array.isArray(sections)) return NextResponse.json({ error: 'sections must be an array' }, { status: 400 });

  await prisma.$transaction(
    sections.map(s =>
      prisma.shoppingListSection.updateMany({
        where: { id: s.id, shoppingListId: id },
        data: { orderIndex: s.orderIndex },
      }),
    ),
  );

  return new Response(null, { status: 204 });
};
