import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
// Components
import { AddToBookButton } from './components/AddToBookButton';
import { ForkButton } from './components/ForkButton';
import { RecipeDetail } from '@/components/RecipeDetail';
// Lib
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublic: true },
    select: { title: true },
  });
  return { title: recipe?.title ?? 'Recipe' };
};

const RecipePage = async ({ params }: Props) => {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublic: true },
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
    },
  });

  if (!recipe) notFound();

  return (
    <RecipeDetail
      recipe={JSON.parse(JSON.stringify(recipe))}
      cookHref={`/recipes/${id}/cook`}
      headerAction={(
        <div className="flex items-center gap-2">
          <AddToBookButton recipeId={id} />
          <ForkButton recipeId={id} />
        </div>
      )}
      metaBadge={(
        <span>
          forked by
          {' '}
          {recipe.forkCount}
          {' '}
          {recipe.forkCount === 1 ? 'cook' : 'cooks'}
        </span>
      )}
    />
  );
};

export default RecipePage;
