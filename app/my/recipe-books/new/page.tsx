import type { Metadata } from 'next';
// Components
import { NewRecipeBookForm } from './components/NewRecipeBookForm';

export const metadata: Metadata = { title: 'New Recipe Book' };

const NewRecipeBookPage = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">New recipe book</h1>
      <NewRecipeBookForm />
    </div>
  );
};

export default NewRecipeBookPage;
