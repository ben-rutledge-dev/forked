import type { Metadata } from 'next';
// Components
import { RecipeForm } from '@/components/RecipeForm';
import { PageHeading } from '@/components/Typography';

export const metadata: Metadata = { title: 'New Recipe' };

const NewRecipePage = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageHeading className="mb-8">New recipe</PageHeading>
      <RecipeForm />
    </div>
  );
};

export default NewRecipePage;
