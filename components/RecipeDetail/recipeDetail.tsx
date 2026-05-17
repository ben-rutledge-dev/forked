import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
// Components
import { CategoryPill } from '@/components/CategoryPill';
import { IngredientsDisplay } from '@/components/IngredientsDisplay';
import { PageHeading, SectionHeading } from '@/components/Typography';
// Types
import { RecipeWithRelations } from '@/types';

type Props = {
  recipe: RecipeWithRelations
  cookHref: string
  cookVariant?: 'primary' | 'secondary'
  headerAction?: ReactNode
  ingredientsAction?: ReactNode
  metaBadge?: ReactNode
};

export const RecipeDetail = async ({
  recipe,
  cookHref,
  cookVariant = 'secondary',
  headerAction,
  ingredientsAction,
  metaBadge,
}: Props) => {
  const t = await getTranslations('recipeDetail');
  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 sm:py-10">
      {recipe.coverImageUrl && (
        <div className="mb-8 -mx-4 sm:mx-0 relative h-64">
          <Image
            src={recipe.coverImageUrl}
            alt=""
            fill
            className="object-cover sm:rounded-xl"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col gap-3 flex-row items-start justify-between">
          <PageHeading>{recipe.title}</PageHeading>
          {headerAction && <div className="flex items-center gap-2 shrink-0">{headerAction}</div>}
        </div>

        {recipe.description && (
          <p className="mt-3 text-stone-600 leading-relaxed">{recipe.description}</p>
        )}

        {(recipe.categories?.length ?? 0) > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.categories!.map(cat => (
              <CategoryPill key={cat.id} href={`/pool?categories=${cat.slug}`}>
                {cat.label}
              </CategoryPill>
            ))}
          </div>
        )}

        {(recipe.tags?.length ?? 0) > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recipe.tags!.map(tag => (
              <CategoryPill key={tag} href={`/my/recipes?tags=${encodeURIComponent(tag)}`}>
                {tag}
              </CategoryPill>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 text-sm text-stone-400 sm:flex-row sm:items-center sm:gap-4">
          {metaBadge}
          {recipe.author && (
            <span>
              {t('by')}
              {' '}
              {recipe.author.isPublic && recipe.author.username
                ? (
                    <Link href={`/u/${recipe.author.username}`} className="underline hover:text-stone-600">
                      {recipe.author.username}
                    </Link>
                  )
                : (
                    <span>{recipe.author.username ?? recipe.author.name ?? t('unknownAuthor')}</span>
                  )}
            </span>
          )}
          {recipe.forkedFrom && (
            <span>
              {t('forkOf')}
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
            className={`sm:ml-auto self-start rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              cookVariant === 'primary'
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'border border-stone-300 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t('cookMode')}
          </Link>
        </div>
      </div>

      {recipe.ingredients.length > 0 && (
        <section className="mb-8">
          <IngredientsDisplay ingredients={recipe.ingredients} action={ingredientsAction} />
        </section>
      )}

      {recipe.steps.length > 0 && (
        <section className="mb-10">
          <SectionHeading className="mb-4">{t('steps')}</SectionHeading>
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
                      {t('timer', {
                        min: Math.floor(step.timerSeconds / 60),
                        sec: step.timerSeconds % 60,
                      })}
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
          <SectionHeading className="mb-4">{t('publicForks')}</SectionHeading>
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
