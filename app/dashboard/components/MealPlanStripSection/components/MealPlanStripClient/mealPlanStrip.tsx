'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
// Data
import type { MealPlanEntry } from '@/data/meal-plans/[mealPlanId]/types';
// Utils
import { formatDayLabel } from '@/utils/dates';

type Props = {
  data: { entries: MealPlanEntry[] }
};

const buildDays = (entries: MealPlanEntry[]): Array<{ dateStr: string, label: string, entries: MealPlanEntry[], isToday: boolean }> => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return Array.from({ length: 7 }, (_, i) => {
    const [y, m, d] = todayStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + i));
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = entries.filter(e => e.date === dateStr);
    return { dateStr, label: formatDayLabel(date, true), entries: dayEntries, isToday: i === 0 };
  });
};

export const MealPlanStrip = ({ data }: Props) => {
  const days = buildDays(data.entries);

  return (
    <Link href="/meal-planner" className="block">
      <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map(({ dateStr, label, entries, isToday }) => {
          const visible = entries.slice(0, 3);
          const overflow = entries.length - 3;
          return (
            <div
              key={dateStr}
              className={`flex-none w-44 rounded-xl p-3 snap-start border ${isToday ? 'border-primary-500 bg-primary-50' : 'border-stone-200 bg-white'}`}
            >
              <p className="text-xs font-medium text-stone-500 mb-2 truncate">{label}</p>
              {visible.length === 0
                ? <span className="text-stone-300 text-sm">—</span>
                : (
                    <div className="space-y-1.5">
                      {visible.map(e => (
                        <div
                          key={e.id}
                          className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2 py-1.5"
                        >
                          {e.recipe?.coverImageUrl
                            ? (
                                <Image
                                  src={e.recipe.coverImageUrl}
                                  alt={e.recipe.title ?? ''}
                                  width={32}
                                  height={32}
                                  className="rounded object-cover h-8 w-8 shrink-0"
                                />
                              )
                            : <div className="h-8 w-8 shrink-0 rounded bg-stone-100" />}
                          <span className="text-xs font-medium text-stone-800 truncate flex-1 min-w-0">
                            {e.recipe?.title ?? '—'}
                          </span>
                        </div>
                      ))}
                      {overflow > 0 && (
                        <p className="text-xs text-stone-400 pl-1">
                          +
                          {overflow}
                          {' '}
                          more
                        </p>
                      )}
                    </div>
                  )}
            </div>
          );
        })}
      </div>
    </Link>
  );
};

export const MealPlanStripEmpty = () => {
  const t = useTranslations('dashboard.mealPlanStrip');
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-5 py-6 text-center">
      <p className="text-sm font-medium text-stone-700 mb-1">{t('planYourWeek')}</p>
      <p className="text-xs text-stone-400 mb-3">{t('addMealsCta')}</p>
      <Link href="/meal-planner" className="text-xs font-medium text-primary-500 hover:underline">
        {t('goToPlanner')}
      </Link>
    </div>
  );
};
