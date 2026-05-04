import type { Metadata } from "next";
import { NewRecipeBookForm } from "./components/NewRecipeBookForm";

export const metadata: Metadata = { title: "New Recipe Book" };

export default function NewRecipeBookPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">New recipe book</h1>
      <NewRecipeBookForm />
    </div>
  );
}
