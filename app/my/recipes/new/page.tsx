import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
// Components
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { RecipeForm } from '@/components/RecipeForm';

export const metadata: Metadata = { title: 'New Recipe' };

const NewRecipePage = async () => {
  const t = await getTranslations('myRecipes');

  return (
    <PageLayout width="narrow">
      <PageHeader title={t('newRecipeHeading')} backHref="/my/recipes" />
      <RecipeForm />
    </PageLayout>
  );
};

export default NewRecipePage;
