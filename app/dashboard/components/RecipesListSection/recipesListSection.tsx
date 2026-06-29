// Data
import type { PostRecipeResponse } from '@/data/recipes/types';
// Components
import { RecipesList } from './components/RecipesSectionClient';
// App
// Queries
import { getUserRecipes } from '@/app/dashboard/queries';

type Props = { userId: string };

export const RecipesListSection = async ({ userId }: Props) => {
  const raw = await getUserRecipes(userId);
  const recipes: PostRecipeResponse[] = raw.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    coverImageUrl: r.coverImageUrl ?? null,
    authorId: r.authorId,
    isPublic: r.isPublic,
    forkedFromId: r.forkedFromId,
    forkCount: r.forkCount,
    tags: r.tags,
    categories: r.categories.map(rc => rc.category.label),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
  return <RecipesList recipes={recipes} />;
};
