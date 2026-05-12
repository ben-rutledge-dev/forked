import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tagsParam = searchParams.get('tags');
  const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : [];
  const categorySlugs = searchParams.get('categories')?.split(',').map(s => s.trim()).filter(Boolean) ?? [];

  const recipes = await prisma.recipe.findMany({
    where: {
      authorId: session.user.id,
      ...(tags.length > 0 && { tags: { hasSome: tags } }),
      ...(categorySlugs.length > 0 && {
        categories: { some: { category: { slug: { in: categorySlugs } } } },
      }),
    },
    select: {
      id: true, title: true, description: true, coverImageUrl: true, forkCount: true,
      isPublic: true, forkedFromId: true, authorId: true, tags: true,
      categories: { select: { category: { select: { id: true, slug: true, label: true, group: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(recipes.map(({ categories, ...r }) => ({
    ...r,
    categories: categories.map(rc => rc.category),
  })));
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, isPublic, coverImageUrl, ingredients, steps, tags } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      coverImageUrl: coverImageUrl || null,
      authorId: session.user.id,
      isPublic: Boolean(isPublic),
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [],
      ingredients: {
        create: (ingredients ?? []).map(
          (ing: { name: string, quantity: string, unit: string }, i: number) => ({
            name: ing.name,
            quantity: ing.quantity || null,
            unit: ing.unit || null,
            orderIndex: i,
          }),
        ),
      },
      steps: {
        create: (steps ?? []).map(
          (step: { instruction: string, timerSeconds: number | string, imageUrl?: string }, i: number) => ({
            instruction: step.instruction,
            timerSeconds: step.timerSeconds ? Number(step.timerSeconds) : null,
            imageUrl: step.imageUrl || null,
            orderIndex: i,
          }),
        ),
      },
    },
  });

  return NextResponse.json(recipe, { status: 201 });
};
