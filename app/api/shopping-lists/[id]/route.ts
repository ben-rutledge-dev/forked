import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

const getMember = async (listId: string, userId: string) => {
  return prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: listId, userId } },
  });
};

export const GET = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getMember(id, session.user.id);
  if (!member?.acceptedAt) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const list = await prisma.shoppingList.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
          items: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
  });

  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ...list, currentUserRole: member.role });
};

export const PUT = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getMember(id, session.user.id);
  if (!member?.acceptedAt || member.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const updated = await prisma.shoppingList.update({
    where: { id },
    data: { title: title.trim() },
  });

  return NextResponse.json(updated);
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getMember(id, session.user.id);
  if (!member?.acceptedAt || member.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.shoppingListMember.delete({ where: { id: member.id } });

  const remainingOwners = await prisma.shoppingListMember.count({
    where: { shoppingListId: id, role: 'OWNER', acceptedAt: { not: null } },
  });

  if (remainingOwners === 0) {
    await prisma.shoppingList.delete({ where: { id } });
  }

  return new Response(null, { status: 204 });
};
