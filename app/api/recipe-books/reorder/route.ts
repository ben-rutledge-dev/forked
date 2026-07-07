import { NextResponse } from 'next/server';
// Data
import { putRecipeBooksReorderSchema } from '@/data/recipe-books/reorder/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';

export const PUT = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = await parseBody(req, putRecipeBooksReorderSchema);
  if (!parsed.success) return parsed.response;
  const { books } = parsed.data;

  await prisma.$transaction(
    books.map(b =>
      prisma.recipeBookMember.updateMany({
        where: { recipeBookId: b.id, userId: session.user.id },
        data: { orderIndex: b.orderIndex },
      }),
    ),
  );

  return new Response(null, { status: 204 });
};
