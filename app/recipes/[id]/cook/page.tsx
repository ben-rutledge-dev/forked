import { notFound } from 'next/navigation';
// Components
import { CookMode } from '@/components/CookMode';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

const CookPage = async ({ params }: Props) => {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const recipe = await prisma.recipe.findUnique({
    where: {
      id,
      ...(userId ? { OR: [{ isPublic: true }, { authorId: userId }] } : { isPublic: true }),
    },
    include: {
      ingredients: { orderBy: { orderIndex: 'asc' } },
      steps: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!recipe) notFound();

  const isOwner = userId === recipe.authorId;

  return (
    <CookMode
      recipe={JSON.parse(JSON.stringify(recipe))}
      backHref={isOwner ? `/recipes/${id}/edit` : `/recipes/${id}`}
    />
  );
};

export default CookPage;
