import { notFound } from 'next/navigation';
// Components
import { CookMode } from '@/components/CookMode';
// Lib
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

const PublicCookPage = async ({ params }: Props) => {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublic: true },
    include: {
      ingredients: { orderBy: { orderIndex: 'asc' } },
      steps: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!recipe) notFound();

  return (
    <CookMode
      recipe={JSON.parse(JSON.stringify(recipe))}
      backHref={`/recipes/${id}`}
    />
  );
};

export default PublicCookPage;
