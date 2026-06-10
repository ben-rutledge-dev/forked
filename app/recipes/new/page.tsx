import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
// Components
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { RecipeForm } from '@/components/RecipeForm';
// Lib
import { auth } from '@/lib/auth';

export const metadata: Metadata = { title: 'New Recipe' };

const NewRecipePage = async () => {
  const session = await auth();
  if (!session) redirect('/auth/signin');
  const t = await getTranslations('myRecipes');

  return (
    <PageLayout width="narrow">
      <PageHeader title={t('newRecipeHeading')} backHref="/recipes" />
      <RecipeForm />
    </PageLayout>
  );
};

export default NewRecipePage;
