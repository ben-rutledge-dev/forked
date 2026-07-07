import { NextResponse } from 'next/server';
// Data
import { putRecipesReorderSchema } from '@/data/recipes/reorder/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';

export const PUT = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = await parseBody(req, putRecipesReorderSchema);
  if (!parsed.success) return parsed.response;
  const { recipes } = parsed.data;

  await prisma.$transaction(
    recipes.map(r =>
      prisma.recipe.updateMany({
        where: { id: r.id, authorId: session.user.id },
        data: { orderIndex: r.orderIndex },
      }),
    ),
  );

  return new Response(null, { status: 204 });
};
