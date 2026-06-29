import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
// Components
import { AddToBookButton } from './components/AddToBookButton';
import { ForkButton } from './components/ForkButton';
import { AddToShoppingListButton } from '@/components/AddToShoppingListButton';
import { Button } from '@/components/Button';
import { PageLayout } from '@/components/PageLayout';
import { RecipeDetail } from '@/components/RecipeDetail';
import { VisibilityBadge } from '@/components/VisibilityBadge';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: recipe?.title ?? 'Recipe' };
};

const RecipePage = async ({ params }: Props) => {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations('myRecipes');
  const tRecipe = await getTranslations('recipe');

  const recipe = await prisma.recipe.findUnique({
    where: {
      id,
      ...(userId ? { OR: [{ isPublic: true }, { authorId: userId }] } : { isPublic: true }),
    },
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
        select: { category: { select: { id: true, slug: true, label: true, group: true } } },
      },
    },
  });

  if (!recipe) notFound();

  const isOwner = userId === recipe.authorId;
  const { categories: rawCategories, ...rest } = recipe;
  const recipeWithCategories = {
    ...rest,
    categories: rawCategories.map(rc => rc.category),
    tags: recipe.tags ?? [],
  };

  const headerAction = isOwner
    ? (
        <div className="flex items-center gap-2">
          <VisibilityBadge isPublic={recipe.isPublic} className="text-xs" />
          <Button href={`/recipes/${id}/edit`} variant="secondary" size="sm">
            {t('editLabel')}
          </Button>
        </div>
      )
    : (
        <div className="flex items-center gap-2">
          <AddToBookButton recipeId={id} />
          <ForkButton recipeId={id} />
        </div>
      );

  return (
    <PageLayout width="narrow" py="sm">
      <RecipeDetail
        recipe={JSON.parse(JSON.stringify(recipeWithCategories))}
        cookHref={`/recipes/${id}/cook`}
        cookVariant={isOwner ? 'primary' : undefined}
        backHref={isOwner ? '/recipes' : '/pool'}
        headerAction={headerAction}
        ingredientsAction={<AddToShoppingListButton recipeId={id} recipeTitle={recipe.title} />}
        metaBadge={!isOwner
          ? (
              <span>
                {tRecipe('forkedBy', { count: recipe.forkCount })}
              </span>
            )
          : undefined}
      />
    </PageLayout>
  );
};

export default RecipePage;
