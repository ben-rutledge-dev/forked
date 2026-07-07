import { NextResponse } from 'next/server';
// Data
import { putShoppingListsReorderSchema } from '@/data/shopping-lists/reorder/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';

export const PUT = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = await parseBody(req, putShoppingListsReorderSchema);
  if (!parsed.success) return parsed.response;
  const { lists } = parsed.data;

  await prisma.$transaction(
    lists.map(l =>
      prisma.shoppingListMember.updateMany({
        where: { shoppingListId: l.id, userId: session.user.id },
        data: { orderIndex: l.orderIndex },
      }),
    ),
  );

  return new Response(null, { status: 204 });
};
