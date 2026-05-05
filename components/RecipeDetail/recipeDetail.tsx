import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
// Types
import { RecipeWithRelations } from '@/types';

type Props = {
  recipe: RecipeWithRelations
  cookHref: string
  cookVariant?: 'primary' | 'secondary'
  headerAction?: ReactNode
  metaBadge?: ReactNode
};

export const RecipeDetail = ({
  recipe,
  cookHref,
  cookVariant = 'secondary',
  headerAction,
  metaBadge,
}: Props) => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {recipe.coverImageUrl && (
        <div className="mb-8 -mx-4 sm:mx-0">
          <Image
            src={recipe.coverImageUrl}
            alt=""
            className="w-full h-64 object-cover sm:rounded-xl"
          />
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold text-stone-900">{recipe.title}</h1>
          {headerAction}
        </div>

        {recipe.description && (
          <p className="mt-3 text-stone-600 leading-relaxed">{recipe.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-stone-400">
          {metaBadge}
          {recipe.author && (
            <span>
              by
              {' '}
              {recipe.author.isPublic && recipe.author.username
                ? (
                    <Link href={`/u/${recipe.author.username}`} className="underline hover:text-stone-600">
                      {recipe.author.username}
                    </Link>
                  )
                : (
                    <span>{recipe.author.username ?? recipe.author.name ?? 'unknown'}</span>
                  )}
            </span>
          )}
          {recipe.forkedFrom && (
            <span>
              fork of
              {' '}
              {recipe.forkedFrom.isPublic
                ? (
                    <Link
                      href={`/recipes/${recipe.forkedFrom.id}`}
                      className="underline hover:text-stone-600"
                    >
                      {recipe.forkedFrom.title}
                    </Link>
                  )
                : (
                    recipe.forkedFrom.title
                  )}
            </span>
          )}
          <Link
            href={cookHref}
            className={`ml-auto rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              cookVariant === 'primary'
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'border border-stone-300 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Cook mode
          </Link>
        </div>
      </div>

      {recipe.ingredients.length > 0 && (
        <section className="mb-8">
          <h2 className="font-medium text-stone-900 mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map(ing => (
              <li key={ing.id} className="flex gap-2 text-stone-700">
                {(ing.quantity || ing.unit) && (
                  <span className="text-stone-400 min-w-[5rem] text-right">
                    {ing.quantity}
                    {' '}
                    {ing.unit}
                  </span>
                )}
                <span>{ing.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.steps.length > 0 && (
        <section className="mb-10">
          <h2 className="font-medium text-stone-900 mb-4">Steps</h2>
          <ol className="space-y-6">
            {recipe.steps.map((step, i) => (
              <li key={step.id} className="flex gap-4">
                <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-500 text-sm font-medium mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-stone-700 leading-relaxed">{step.instruction}</p>
                  {step.timerSeconds && (
                    <p className="mt-1 text-sm text-stone-400">
                      Timer:
                      {' '}
                      {Math.floor(step.timerSeconds / 60)}
                      m
                      {' '}
                      {step.timerSeconds % 60}
                      s
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {(recipe.forks?.length ?? 0) > 0 && (
        <section className="border-t border-stone-200 pt-8">
          <h2 className="font-medium text-stone-900 mb-4">Public forks</h2>
          <ul className="space-y-3">
            {recipe.forks!.map(fork => (
              <li key={fork.id}>
                <Link
                  href={`/recipes/${fork.id}`}
                  className="block rounded-lg border border-stone-200 p-4 hover:border-stone-300 transition-colors"
                >
                  <p className="font-medium text-stone-900">{fork.title}</p>
                  {fork.description && (
                    <p className="mt-1 text-sm text-stone-500 line-clamp-1">{fork.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
