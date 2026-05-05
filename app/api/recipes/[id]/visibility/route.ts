import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const PATCH = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { isPublic } = await req.json();

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (recipe.authorId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updated = await prisma.recipe.update({
    where: { id },
    data: { isPublic: Boolean(isPublic) },
  });

  return NextResponse.json(updated);
};
