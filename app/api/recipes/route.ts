import { NextResponse } from 'next/server';
// Data
import { postRecipeSchema } from '@/data/recipes/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';
// Utils
import { parseQuantity } from '@/utils/units';
import { UnitType } from '@/generated/prisma/client';

const VALID_UNIT_KEYS = new Set<string>(Object.values(UnitType));

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
      isPublic: true, forkedFromId: true, authorId: true, tags: true, orderIndex: true,
      categories: { select: { category: { select: { id: true, slug: true, label: true, group: true } } } },
    },
    orderBy: { orderIndex: 'asc' },
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

  const parsed = await parseBody(req, postRecipeSchema);
  if (!parsed.success) return parsed.response;
  const { title, description, isPublic, coverImageUrl, ingredients, steps, tags } = parsed.data;

  const lastRecipe = await prisma.recipe.findFirst({
    where: { authorId: session.user.id },
    orderBy: { orderIndex: 'desc' },
  });

  try {
    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        coverImageUrl: coverImageUrl || null,
        authorId: session.user.id,
        isPublic: Boolean(isPublic),
        tags: (tags ?? []).map(t => t.trim().toLowerCase()).filter(Boolean),
        orderIndex: (lastRecipe?.orderIndex ?? -1) + 1,
        ingredients: {
          create: (ingredients ?? []).map((ing, i) => {
            if (ing.unitKey && !VALID_UNIT_KEYS.has(ing.unitKey)) {
              throw new Error(`Invalid unitKey: ${ing.unitKey}`);
            }
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

    return NextResponse.json(recipe, { status: 201 });
  }
  catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid unitKey')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
};
