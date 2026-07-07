import { NextResponse } from 'next/server';
// Data
import { putFavouriteRecipesReorderSchema } from '@/data/recipes/favourites/reorder/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';

export const PUT = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = await parseBody(req, putFavouriteRecipesReorderSchema);
  if (!parsed.success) return parsed.response;
  const { favourites } = parsed.data;

  await prisma.$transaction(
    favourites.map(f =>
      prisma.recipeFavourite.updateMany({
        where: { recipeId: f.recipeId, userId: session.user.id },
        data: { orderIndex: f.orderIndex },
      }),
    ),
  );

  return new Response(null, { status: 204 });
};
