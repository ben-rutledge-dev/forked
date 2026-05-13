import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
// Components
import { NewRecipeBookForm } from './components/NewRecipeBookForm';
import { PageHeading } from '@/components/Typography';

export const metadata: Metadata = { title: 'New Recipe Book' };

const NewRecipeBookPage = async () => {
  const t = await getTranslations('recipeBooks');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageHeading className="mb-8">{t('newHeading')}</PageHeading>
      <NewRecipeBookForm />
    </div>
  );
};

export default NewRecipeBookPage;
