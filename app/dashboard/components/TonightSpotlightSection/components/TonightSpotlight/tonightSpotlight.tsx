'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons';
// Components
import { RecipeTagPill } from '@/components/RecipeTagPill';
// Utils
import { addDays, formatDateStrLabel, todayStr } from '@/utils/dates';

export type SpotlightEntry = {
  id: string
  slotId: string
  slotLabel: string
  date: string
  orderIndex: number
  recipe: { id: string, title: string, coverImageUrl: string | null, tags: string[], categories: string[] } | null
};

type TonightSpotlightProps = {
  data: { entries: SpotlightEntry[] } | null
};

export const TonightSpotlight: React.FC<TonightSpotlightProps> = (props) => {
  const { data } = props;
  const t = useTranslations('dashboard.spotlight');

  const today = todayStr();
  const tomorrowStr = addDays(today, 1);

  const allSorted = (data?.entries ?? [])
    .filter(e => e.date >= today && e.recipe)
    .sort((a, b) => a.date.localeCompare(b.date) || a.orderIndex - b.orderIndex);

  // Build a centred window: 1 before + current + 2 after (max 4 dots)
  const rawTarget = getInitialIndex(allSorted, today, tomorrowStr);
  const windowStart = Math.max(0, rawTarget - 1);
  const upcoming = allSorted.slice(windowStart, windowStart + 4);

  const [index, setIndex] = useState(rawTarget - windowStart);

  const getDateLabel = (dateStr: string) => {
    if (dateStr === today) return `${t('today')} · ${formatDateStrLabel(dateStr)}`;
    if (dateStr === tomorrowStr) return `${t('tomorrow')} · ${formatDateStrLabel(dateStr)}`;
    return formatDateStrLabel(dateStr);
  };

  const current = upcoming[index] ?? null;

  if (!current) {
    return (
      <div className="rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 px-5 py-8 flex flex-col items-center justify-center text-center min-h-72">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">{t('nothingPlanned')}</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">{t('addMealCta')}</p>
        <Link href="/meal-planner" className="text-xs font-medium text-primary-500 hover:underline">
          {t('openPlanner')}
        </Link>
      </div>
    );
  }

  const recipe = current.recipe!;

  return (
    <div>
      <div className="rounded-xl squircle shadow-sm overflow-hidden bg-white dark:bg-stone-800 flex flex-col sm:flex-row sm:min-h-72">
        {/* Image */}
        <div className="relative h-52 sm:h-auto sm:w-72 sm:shrink-0 bg-linear-to-br from-stone-100 to-orange-100 dark:from-stone-700 dark:to-stone-700">
          {recipe.coverImageUrl && (
            <Image
              src={recipe.coverImageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-1 p-5">
          <div>
            <div className="flex items-start justify-between mb-1">
              <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
                {getDateLabel(current.date)}
                {' · '}
                {current.slotLabel}
              </p>
              <Link href="/meal-planner" className="text-xs text-primary-500 hover:underline shrink-0 ml-2">
                {t('openPlanner')}
              </Link>
            </div>
            <h2 className="font-fraunces text-xl font-semibold text-stone-900 dark:text-stone-100 leading-tight mb-3">
              {recipe.title}
            </h2>
            {(recipe.tags.length > 0 || recipe.categories.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {recipe.categories.map(label => (
                  <RecipeTagPill key={label} href={`/recipes?categories=${encodeURIComponent(label)}`}>{label}</RecipeTagPill>
                ))}
                {recipe.tags.map(tag => (
                  <RecipeTagPill key={tag} href={`/recipes?tags=${encodeURIComponent(tag)}`}>{tag}</RecipeTagPill>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="md" href={`/recipes/${recipe.id}/cook`} className="flex-1 text-center">
              {t('startCooking')}
            </Button>
            <Button variant="secondary" size="md" href={`/recipes/${recipe.id}`} className="flex-1 text-center">
              {t('viewRecipe')}
            </Button>
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      {upcoming.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label={t('prevMeal')}
            className="p-1 rounded-full text-stone-400 dark:text-stone-500 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center">
            {upcoming.map((entry, i) => (
              <button
                key={entry.id}
                onClick={() => setIndex(i)}
                aria-label={`Meal ${i + 1}`}
                className={`cursor-pointer px-1 py-2 rounded-full transition-all duration-150 flex items-center justify-center before:block before:rounded-full before:transition-all before:duration-150 ${
                  i === index
                    ? 'before:w-2 before:h-2 before:bg-stone-500 dark:before:bg-stone-400'
                    : 'before:w-1.5 before:h-1.5 before:bg-stone-300 dark:before:bg-stone-600 hover:before:bg-stone-400 dark:hover:before:bg-stone-500'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setIndex(i => Math.min(upcoming.length - 1, i + 1))}
            disabled={index === upcoming.length - 1}
            aria-label={t('nextMeal')}
            className="p-1 rounded-full text-stone-400 dark:text-stone-500 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const getInitialIndex = (entries: SpotlightEntry[], todayStr: string, tomorrowStr: string): number => {
  if (entries.length === 0) return 0;
  const hour = new Date().getHours();
  const todayEntries = entries.filter(e => e.date === todayStr);
  const tomorrowEntries = entries.filter(e => e.date === tomorrowStr);

  let target: SpotlightEntry | undefined;
  if (hour < 10) {
    target = todayEntries[0];
  }
  else if (hour < 14) {
    target = todayEntries[1] ?? todayEntries[0];
  }
  else if (hour < 20) {
    target = todayEntries[2] ?? todayEntries[todayEntries.length - 1];
  }
  else {
    target = tomorrowEntries[0] ?? todayEntries[todayEntries.length - 1];
  }

  const idx = target ? entries.indexOf(target) : -1;
  return idx === -1 ? 0 : idx;
};
