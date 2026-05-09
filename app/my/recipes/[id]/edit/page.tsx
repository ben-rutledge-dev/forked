import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
// Components
import { DeleteButton } from './components/DeleteButton';
import { Button } from '@/components/Button';
import { RecipeForm } from '@/components/RecipeForm';
import { PageHeading } from '@/components/Typography';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id }, select: { title: true } });
  return { title: `Edit — ${recipe?.title ?? 'Recipe'}` };
};

const EditRecipePage = async ({ params }: Props) => {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id, authorId: session!.user.id },
    include: {
      forkedFrom: { select: { id: true, title: true, isPublic: true } },
      ingredients: { orderBy: { orderIndex: 'asc' } },
      steps: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <PageHeading>Edit recipe</PageHeading>
        <div className="flex items-center gap-3">
          <Button href={`/my/recipes/${id}/cook`} variant="primary" size="md" shape="pill">Cook mode</Button>
          <DeleteButton recipeId={id} />
        </div>
      </div>

      <RecipeForm
        recipeId={id}
        forkedFrom={
          recipe.forkedFrom
            ? {
                id: recipe.forkedFrom.id,
                title: recipe.forkedFrom.title,
                isPublic: recipe.forkedFrom.isPublic,
              }
            : null
        }
        initialData={{
          title: recipe.title,
          description: recipe.description ?? '',
          isPublic: recipe.isPublic,
          coverImageUrl: recipe.coverImageUrl ?? '',
          ingredients: recipe.ingredients.map(i => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity ?? '',
            unit: i.unit ?? '',
          })),
          steps: recipe.steps.map(s => ({
            id: s.id,
            instruction: s.instruction,
            timerSeconds: s.timerSeconds ?? '',
            imageUrl: s.imageUrl ?? '',
          })),
        }}
      />
    </div>
  );
};

export default EditRecipePage;
