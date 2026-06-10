'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
// Data
import type { MealPlanEntry } from '@/data/meal-plans/[mealPlanId]/types';
// Components
import { Button } from '@/components/Button';
// Utils
import { formatDayLabel } from '@/utils/dates';

type Props = {
  data: { entries: MealPlanEntry[] } | null
};

export const TonightSpotlight = ({ data }: Props) => {
  const t = useTranslations('dashboard.spotlight');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dateLabel = formatDayLabel(today);

  const todayEntries = data?.entries.filter(e => e.date === todayStr) ?? [];
  const primary = todayEntries[0]?.recipe ?? null;
  const also = todayEntries.slice(1).filter(e => e.recipe);

  if (!data || !primary) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white px-5 py-8 flex flex-col items-center justify-center text-center min-h-72">
        <p className="text-sm font-medium text-stone-500 mb-1">{t('nothingPlanned')}</p>
        <p className="text-xs text-stone-400 mb-3">{t('addMealCta')}</p>
        <Link href="/meal-planner" className="text-xs font-medium text-primary-500 hover:underline">
          {t('openPlanner')}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden bg-white flex flex-col sm:flex-row sm:min-h-72">
      {/* Image — top on mobile, left on desktop */}
      <div className="relative h-52 sm:h-auto sm:w-72 sm:shrink-0 bg-linear-to-br from-stone-100 to-orange-100">
        {primary.coverImageUrl && (
          <Image
            src={primary.coverImageUrl}
            alt={primary.title}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Content — right */}
      <div className="flex flex-col justify-between flex-1 p-5">
        <div>
          <div className="flex items-start justify-between mb-1">
            <p className="text-xs font-medium text-stone-400">{t('tonight', { date: dateLabel })}</p>
            <Link href="/meal-planner" className="text-xs text-primary-500 hover:underline">
              {t('openPlanner')}
            </Link>
          </div>
          <h2 className="text-xl font-semibold text-stone-900 leading-tight mb-3">{primary.title}</h2>
          {also.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-stone-400">{t('alsoToday')}</span>
              {also.map(e => (
                <span key={e.id} className="text-xs bg-stone-100 text-stone-600 rounded-full px-2.5 py-1">
                  {e.recipe!.title}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="primary" size="md" shape="rounded" href={`/recipes/${primary.id}/cook`} className="flex-1 text-center">
            {t('startCooking')}
          </Button>
          <Button variant="secondary" size="md" shape="rounded" href={`/recipes/${primary.id}`} className="flex-1 text-center">
            {t('viewRecipe')}
          </Button>
        </div>
      </div>
    </div>
  );
};
