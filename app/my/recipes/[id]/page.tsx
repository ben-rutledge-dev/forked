import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
// Components
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { RecipeDetail } from '@/components/RecipeDetail';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id }, select: { title: true } });
  return { title: recipe?.title ?? 'Recipe' };
};

const MyRecipePage = async ({ params }: Props) => {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id, authorId: session!.user.id },
    include: {
      forkedFrom: { select: { id: true, title: true, isPublic: true } },
      ingredients: { orderBy: { orderIndex: 'asc' } },
      steps: { orderBy: { orderIndex: 'asc' } },
      categories: {
        select: { category: { select: { id: true, slug: true, label: true, group: true } } },
      },
    },
  });

  if (!recipe) notFound();

  const { categories: rawCategories, ...rest } = recipe;
  const recipeWithCategories = {
    ...rest,
    categories: rawCategories.map(rc => rc.category),
  };

  return (
    <RecipeDetail
      recipe={JSON.parse(JSON.stringify(recipeWithCategories))}
      cookHref={`/my/recipes/${id}/cook`}
      cookVariant="primary"
      headerAction={(
        <div className="flex items-center gap-2">
          <Badge variant={recipe.isPublic ? 'success' : 'neutral'} className="text-xs">
            {recipe.isPublic ? 'public' : 'private'}
          </Badge>
          <Button
            href={`/my/recipes/${id}/edit`}
            variant="secondary"
            size="sm"
            shape="pill"
          >
            Edit
          </Button>
        </div>
      )}
    />
  );
};

export default MyRecipePage;
