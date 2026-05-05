import type { Metadata } from 'next';
// Components
import { RecipeForm } from '@/components/RecipeForm';

export const metadata: Metadata = { title: 'New Recipe' };

const NewRecipePage = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">New recipe</h1>
      <RecipeForm />
    </div>
  );
};

export default NewRecipePage;
