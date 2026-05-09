import type { Metadata } from 'next';
// Components
import { NewRecipeBookForm } from './components/NewRecipeBookForm';
import { PageHeading } from '@/components/Typography';

export const metadata: Metadata = { title: 'New Recipe Book' };

const NewRecipeBookPage = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageHeading className="mb-8">New recipe book</PageHeading>
      <NewRecipeBookForm />
    </div>
  );
};

export default NewRecipeBookPage;
