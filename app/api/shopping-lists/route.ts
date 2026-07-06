import { NextResponse } from 'next/server';
// Data
import { postShoppingListSchema } from '@/data/shopping-lists/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const members = await prisma.shoppingListMember.findMany({
    where: { userId },
    include: {
      shoppingList: {
        include: {
          _count: {
            select: {
              members: { where: { acceptedAt: { not: null } } },
              items: { where: { checked: false } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const accepted = members
    .filter(m => m.acceptedAt !== null)
    .map(m => ({
      id: m.shoppingList.id,
      title: m.shoppingList.title,
      createdAt: m.shoppingList.createdAt.toISOString(),
      updatedAt: m.shoppingList.updatedAt.toISOString(),
      role: m.role,
      memberCount: m.shoppingList._count.members,
      uncheckedCount: m.shoppingList._count.items,
    }));

  const pending = members
    .filter(m => m.acceptedAt === null)
    .map(m => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt.toISOString(),
      shoppingList: {
        id: m.shoppingList.id,
        title: m.shoppingList.title,
      },
      invitedByUserId: m.invitedByUserId,
    }));

  return NextResponse.json({ lists: accepted, pending });
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = await parseBody(req, postShoppingListSchema);
  if (!parsed.success) return parsed.response;
  const { title } = parsed.data;

  const list = await prisma.shoppingList.create({
    data: {
      title: title.trim(),
      members: {
        create: {
          userId: session.user.id,
          role: 'OWNER',
          acceptedAt: new Date(),
          invitedByUserId: session.user.id,
        },
      },
      sections: {
        create: {
          title: 'Unsorted',
          orderIndex: 0,
        },
      },
    },
  });

  return NextResponse.json(list, { status: 201 });
};
