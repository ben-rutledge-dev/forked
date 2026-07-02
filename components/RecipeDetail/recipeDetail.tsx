import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
// Components
import { Button } from '@/components/Button';
import { IngredientsDisplay } from '@/components/IngredientsDisplay';
import { PageHeader } from '@/components/PageHeader';
import { RecipeTagPill } from '@/components/RecipeTagPill';
import { SectionHeading } from '@/components/Typography';
// Types
import { RecipeWithRelations } from '@/types';

type RecipeDetailProps = {
  recipe: RecipeWithRelations
  cookHref: string
  cookVariant?: 'primary' | 'secondary'
  headerAction?: ReactNode
  ingredientsAction?: ReactNode
  metaBadge?: ReactNode
  backHref?: string
};

export const RecipeDetail = async (props: RecipeDetailProps) => {
  const { recipe, cookHref, cookVariant = 'secondary', headerAction, ingredientsAction, metaBadge, backHref } = props;
  const t = await getTranslations('recipeDetail');
  return (
    <div>
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
        <PageHeader title={recipe.title} action={headerAction} backHref={backHref} />

        {recipe.description && (
          <p className="mt-3 text-stone-600 dark:text-stone-400 leading-relaxed">{recipe.description}</p>
        )}

        {((recipe.categories?.length ?? 0) > 0 || (recipe.tags?.length ?? 0) > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.categories!.map(cat => (
              <RecipeTagPill key={cat.id} href={`/recipes?categories=${cat.slug}`}>
                {cat.label}
              </RecipeTagPill>
            ))}
            {recipe.tags!.map(tag => (
              <RecipeTagPill key={tag} href={`/recipes?tags=${encodeURIComponent(tag)}`}>
                {tag}
              </RecipeTagPill>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 text-sm text-stone-400 dark:text-stone-500 sm:flex-row sm:items-center sm:gap-4">
          {metaBadge}
          {recipe.author && (
            <span>
              {t('by')}
              {' '}
              {recipe.author.isPublic && recipe.author.username
                ? (
                    <Link href={`/u/${recipe.author.username}`} className="underline hover:text-stone-600 dark:hover:text-stone-400">
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
                      className="underline hover:text-stone-600 dark:hover:text-stone-400"
                    >
                      {recipe.forkedFrom.title}
                    </Link>
                  )
                : (
                    recipe.forkedFrom.title
                  )}
            </span>
          )}
          <Button
            href={cookHref}
            variant={cookVariant === 'primary' ? 'primary' : 'secondary'}
            size="md"
            className="sm:ml-auto self-start"
          >
            {t('cookMode')}
          </Button>
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
                <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-sm font-medium mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{step.instruction}</p>
                  {step.timerSeconds && (
                    <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
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
        <section className="border-t border-stone-200 dark:border-stone-700 pt-8">
          <SectionHeading className="mb-4">{t('publicForks')}</SectionHeading>
          <ul className="space-y-3">
            {recipe.forks!.map(fork => (
              <li key={fork.id}>
                <Link
                  href={`/recipes/${fork.id}`}
                  className="block rounded-lg border border-stone-200 dark:border-stone-700 p-4 hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
                >
                  <p className="font-medium text-stone-900 dark:text-stone-100">{fork.title}</p>
                  {fork.description && (
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 line-clamp-1">{fork.description}</p>
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
