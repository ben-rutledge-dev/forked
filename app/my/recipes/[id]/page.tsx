import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
// Components
import { Badge } from '@/components/Badge';
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
    },
  });

  if (!recipe) notFound();

  return (
    <RecipeDetail
      recipe={JSON.parse(JSON.stringify(recipe))}
      cookHref={`/my/recipes/${id}/cook`}
      cookVariant="primary"
      headerAction={(
        <Link
          href={`/my/recipes/${id}/edit`}
          className="shrink-0 rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
        >
          Edit
        </Link>
      )}
      metaBadge={(
        <Badge variant={recipe.isPublic ? 'success' : 'neutral'} className="text-xs">
          {recipe.isPublic ? 'public' : 'private'}
        </Badge>
      )}
    />
  );
};

export default MyRecipePage;
