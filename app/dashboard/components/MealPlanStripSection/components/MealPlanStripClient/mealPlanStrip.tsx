'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
// Components
import { PlannerDayLabel } from '@/components/PlannerDayLabel';
// Utils
import { addDays, todayStr } from '@/utils/dates';

export type DashboardEntry = {
  id: string
  slotId: string
  slotLabel: string
  date: string
  orderIndex: number
  recipe: { id: string, title: string, coverImageUrl: string | null } | null
};

type MealPlanStripProps = {
  data: { entries: DashboardEntry[] }
  startDateStr: string
};

export const MealPlanStrip: React.FC<MealPlanStripProps> = (props) => {
  const { data, startDateStr } = props;
  const t = useTranslations('dashboard.mealPlanStrip');
  const days = buildDays(data.entries, startDateStr);

  return (
    <div className="rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 divide-y divide-stone-100 dark:divide-stone-700 px-5 overflow-hidden">
      {days.map(({ dateStr, entries, isToday, isPast }) => {
        const overflow = entries.length - 3;
        const visible = entries.slice(0, 3);
        return (
          <div key={dateStr} className={`py-3 -mx-5 px-5 ${isToday ? 'bg-primary-50 dark:bg-stone-700' : ''}`}>
            <div className={`flex gap-5 ${isPast ? 'opacity-40' : ''}`}>
              {/* Date label */}
              <PlannerDayLabel dateStr={dateStr} isToday={isToday} />

              {/* Entries */}
              <div className="flex-1 min-w-0 flex items-center">
                {visible.length === 0
                  ? <span className="text-sm text-stone-300 dark:text-stone-600">—</span>
                  : (
                      <div className="flex gap-2 flex-wrap">
                        {visible.map(e => (
                          e.recipe
                            ? (
                                <Link
                                  key={e.id}
                                  href={`/recipes/${e.recipe.id}`}
                                  className="flex items-end gap-2 rounded-lg squircle shadow-sm bg-white dark:bg-stone-700 p-2 hover:shadow-md transition-shadow"
                                >
                                  {e.recipe.coverImageUrl
                                    ? (
                                        <Image
                                          src={e.recipe.coverImageUrl}
                                          alt={e.recipe.title}
                                          width={28}
                                          height={28}
                                          className="rounded object-cover h-7 w-7 shrink-0"
                                        />
                                      )
                                    : <div className="h-7 w-7 shrink-0 rounded bg-stone-100 dark:bg-stone-600" />}
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 truncate">
                                      {e.slotLabel}
                                    </span>
                                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate leading-tight">
                                      {e.recipe.title}
                                    </span>
                                  </div>
                                </Link>
                              )
                            : (
                                <div key={e.id} className="flex items-end gap-2 rounded-lg squircle shadow-sm bg-white dark:bg-stone-700 p-2">
                                  <div className="h-7 w-7 shrink-0 rounded bg-stone-100 dark:bg-stone-600" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 truncate">
                                      {e.slotLabel}
                                    </span>
                                    <span className="text-xs font-medium text-stone-300 dark:text-stone-600 truncate">—</span>
                                  </div>
                                </div>
                              )
                        ))}
                        {overflow > 0 && (
                          <p className="text-xs text-stone-400 dark:text-stone-500 self-center">{t('overflow', { count: overflow })}</p>
                        )}
                      </div>
                    )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const MealPlanStripEmpty = () => {
  const t = useTranslations('dashboard.mealPlanStrip');
  return (
    <div className="rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 px-5 py-6 text-center">
      <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('planYourWeek')}</p>
      <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">{t('addMealsCta')}</p>
      <Link href="/meal-planner" className="text-xs font-medium text-primary-500 hover:underline">
        {t('goToPlanner')}
      </Link>
    </div>
  );
};

const buildDays = (entries: DashboardEntry[], startDateStr: string): Array<{ dateStr: string, entries: DashboardEntry[], isToday: boolean, isPast: boolean }> => {
  const today = todayStr();

  return Array.from({ length: 7 }, (_, i) => {
    const dateStr = addDays(startDateStr, i);
    return {
      dateStr,
      entries: entries.filter(e => e.date === dateStr),
      isToday: dateStr === today,
      isPast: dateStr < today,
    };
  });
};
