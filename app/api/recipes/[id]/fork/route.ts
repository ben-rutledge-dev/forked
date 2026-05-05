import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const POST = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const original = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { orderIndex: 'asc' } },
      steps: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!original) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  if (!original.isPublic) return NextResponse.json({ error: 'Recipe is not public' }, { status: 403 });

  const [fork] = await prisma.$transaction([
    prisma.recipe.create({
      data: {
        title: original.title,
        description: original.description,
        authorId: session.user.id,
        isPublic: false,
        forkedFromId: original.id,
        ingredients: {
          create: original.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            orderIndex: ing.orderIndex,
          })),
        },
        steps: {
          create: original.steps.map(step => ({
            instruction: step.instruction,
            imageUrl: step.imageUrl,
            timerSeconds: step.timerSeconds,
            orderIndex: step.orderIndex,
          })),
        },
      },
    }),
    prisma.recipe.update({
      where: { id },
      data: { forkCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(fork, { status: 201 });
};
