import { NextResponse } from 'next/server';
// Data
import { putRecipeSchema } from '@/data/recipes/[recipeId]/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';
// Utils
import { parseQuantity } from '@/utils/units';
import { UnitType } from '@/generated/prisma/client';

const VALID_UNIT_KEYS = new Set<string>(Object.values(UnitType));

type Params = { params: Promise<{ id: string }> };

export const GET = async (_req: Request, { params }: Params) => {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, username: true, isPublic: true } },
      forkedFrom: { select: { id: true, title: true, isPublic: true } },
      ingredients: { orderBy: { orderIndex: 'asc' } },
      steps: { orderBy: { orderIndex: 'asc' } },
      forks: {
        where: { isPublic: true },
        select: {
          id: true,
          title: true,
          description: true,
          author: { select: { name: true, username: true, isPublic: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      categories: {
        select: {
          category: { select: { id: true, slug: true, label: true, group: true } },
        },
      },
    },
  });

  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { categories: rawCategories, tags, ...rest } = recipe;
  return NextResponse.json({
    ...rest,
    categories: rawCategories.map(rc => rc.category),
    tags,
  });
};

export const PUT = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (recipe.authorId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = await parseBody(req, putRecipeSchema);
  if (!parsed.success) return parsed.response;
  const { title, description, isPublic, coverImageUrl, ingredients, steps, categoryIds, tags } = parsed.data;

  if (isPublic && (!categoryIds || categoryIds.length === 0)) {
    return NextResponse.json({ error: 'Select at least one category to make this recipe public' }, { status: 400 });
  }

  for (const ing of ingredients ?? []) {
    if (ing.unitKey && !VALID_UNIT_KEYS.has(ing.unitKey)) {
      return NextResponse.json({ error: `Invalid unitKey: ${ing.unitKey}` }, { status: 400 });
    }
  }

  await prisma.ingredient.deleteMany({ where: { recipeId: id } });
  await prisma.step.deleteMany({ where: { recipeId: id } });

  const updated = await prisma.$transaction(async (tx) => {
    if (categoryIds !== undefined) {
      await tx.recipeCategory.deleteMany({ where: { recipeId: id } });
      if (categoryIds.length > 0) {
        await tx.recipeCategory.createMany({
          data: categoryIds.map(categoryId => ({ recipeId: id, categoryId })),
        });
      }
    }

    return tx.recipe.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        coverImageUrl: coverImageUrl || null,
        isPublic: Boolean(isPublic),
        ...(tags !== undefined && { tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean) }),
        ingredients: {
          create: (ingredients ?? []).map((ing, i) => {
            const hasUnitKey = !!ing.unitKey;
            return {
              name: ing.name,
              quantity: parseQuantity(ing.quantity ?? ''),
              unit: hasUnitKey ? null : (ing.unit || null),
              unitKey: hasUnitKey ? (ing.unitKey as UnitType) : null,
              orderIndex: i,
            };
          }),
        },
        steps: {
          create: (steps ?? []).map((step, i) => ({
            instruction: step.instruction,
            timerSeconds: step.timerSeconds ? Number(step.timerSeconds) : null,
            imageUrl: step.imageUrl || null,
            orderIndex: i,
          })),
        },
      },
    });
  });

  return NextResponse.json(updated);
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (recipe.authorId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.recipe.delete({ where: { id } });
  return new Response(null, { status: 204 });
};
