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

type ItemInput = {
  name: string
  sectionId: string
  recipeId?: string
  recipeTitle?: string
};

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getAcceptedMember(id, session.user.id);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { items } = await req.json() as { items: ItemInput[] };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items must be a non-empty array' }, { status: 400 });
  }

  // Get max orderIndex per section to set correct orderIndex for new items
  const sectionIds = [...new Set(items.map(i => i.sectionId))];
  const maxOrders = await Promise.all(
    sectionIds.map(async (sectionId) => {
      const max = await prisma.shoppingListItem.findFirst({
        where: { sectionId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true },
      });
      return { sectionId, max: max?.orderIndex ?? -1 };
    }),
  );
  const maxBySection = Object.fromEntries(maxOrders.map(m => [m.sectionId, m.max]));

  const created = await prisma.$transaction(
    items.map((item) => {
      const orderIndex = ++maxBySection[item.sectionId];
      return prisma.shoppingListItem.create({
        data: {
          sectionId: item.sectionId,
          shoppingListId: id,
          name: item.name,
          orderIndex,
          recipeId: item.recipeId ?? null,
          recipeTitle: item.recipeTitle ?? null,
        },
      });
    }),
  );

  return NextResponse.json(created, { status: 201 });
};
