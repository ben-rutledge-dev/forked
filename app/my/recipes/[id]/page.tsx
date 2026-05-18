import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
// Components
import { AddToShoppingListButton } from '@/components/AddToShoppingListModal';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { PageLayout } from '@/components/PageLayout';
import { RecipeDetail } from '@/components/RecipeDetail';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

type MyRecipeHeaderActionProps = {
  recipeId: string
  isPublic: boolean
};

const MyRecipeHeaderAction: React.FC<MyRecipeHeaderActionProps> = async (props) => {
  const { recipeId, isPublic } = props;
  const t = await getTranslations('myRecipes');
  return (
    <div className="flex items-center gap-2">
      <Badge variant={isPublic ? 'success' : 'neutral'} className="text-xs">
        {isPublic ? t('publicBadge') : t('privateBadge')}
      </Badge>
      <Button href={`/my/recipes/${recipeId}/edit`} variant="secondary" size="sm" shape="pill">
        {t('editLabel')}
      </Button>
    </div>
  );
};

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
    <PageLayout width="narrow" py="sm">
      <RecipeDetail
        recipe={JSON.parse(JSON.stringify(recipeWithCategories))}
        cookHref={`/my/recipes/${id}/cook`}
        cookVariant="primary"
        backHref="/my/recipes"
        headerAction={<MyRecipeHeaderAction recipeId={id} isPublic={recipe.isPublic} />}
        ingredientsAction={<AddToShoppingListButton recipeId={id} recipeTitle={recipe.title} />}
      />
    </PageLayout>
  );
};

export default MyRecipePage;
