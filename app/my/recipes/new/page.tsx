import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
// Components
import { RecipeForm } from '@/components/RecipeForm';
import { PageHeading } from '@/components/Typography';

export const metadata: Metadata = { title: 'New Recipe' };

const NewRecipePage = async () => {
  const t = await getTranslations('myRecipes');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageHeading className="mb-8">{t('newRecipeHeading')}</PageHeading>
      <RecipeForm />
    </div>
  );
};

export default NewRecipePage;
