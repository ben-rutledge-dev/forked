'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
// Utils

export type DashboardEntry = {
  id: string
  slotId: string
  slotLabel: string
  date: string
  orderIndex: number
  recipe: { id: string, title: string, coverImageUrl: string | null } | null
};

type Props = {
  data: { entries: DashboardEntry[] }
  startDateStr: string
};

const buildDays = (entries: DashboardEntry[], startDateStr: string): Array<{ dateStr: string, weekday: string, dayNum: number, entries: DashboardEntry[], isToday: boolean, isPast: boolean }> => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [sy, sm, sd] = startDateStr.split('-').map(Number);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.UTC(sy, sm - 1, sd + i));
    const dateStr = date.toISOString().split('T')[0];
    const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' }).format(date);
    return {
      dateStr,
      weekday: weekday.toUpperCase(),
      dayNum: date.getUTCDate(),
      entries: entries.filter(e => e.date === dateStr),
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
    };
  });
};

export const MealPlanStrip = ({ data, startDateStr }: Props) => {
  const t = useTranslations('dashboard.mealPlanStrip');
  const days = buildDays(data.entries, startDateStr);

  return (
    <div className="rounded-xl squircle shadow-sm bg-white divide-y divide-stone-100 px-5 overflow-hidden">
      {days.map(({ dateStr, weekday, dayNum, entries, isToday, isPast }) => {
        const overflow = entries.length - 3;
        const visible = entries.slice(0, 3);
        return (
          <div key={dateStr} className={`py-3 -mx-5 px-5 ${isToday ? 'bg-primary-50' : ''}`}>
            <div className={`flex gap-5 ${isPast ? 'opacity-40' : ''}`}>
              {/* Date label */}
              <div className="w-10 shrink-0 pt-0.5 text-center">
                <p className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? 'text-primary-500' : 'text-stone-400'}`}>{weekday}</p>
                <p className={`text-base font-semibold leading-tight ${isToday ? 'text-primary-600' : 'text-stone-700'}`}>{dayNum}</p>
              </div>

              {/* Entries */}
              <div className="flex-1 min-w-0 flex items-center">
                {visible.length === 0
                  ? <span className="text-sm text-stone-300">—</span>
                  : (
                      <div className="flex gap-2 flex-wrap">
                        {visible.map(e => (
                          e.recipe
                            ? (
                                <Link
                                  key={e.id}
                                  href={`/recipes/${e.recipe.id}`}
                                  className="flex items-end gap-2 rounded-lg squircle shadow-sm bg-white p-2 hover:shadow-md transition-shadow"
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
                                    : <div className="h-7 w-7 shrink-0 rounded bg-stone-100" />}
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 truncate">
                                      {e.slotLabel}
                                    </span>
                                    <span className="text-xs font-medium text-stone-800 truncate leading-tight">
                                      {e.recipe.title}
                                    </span>
                                  </div>
                                </Link>
                              )
                            : (
                                <div key={e.id} className="flex items-end gap-2 rounded-lg squircle shadow-sm bg-white p-2">
                                  <div className="h-7 w-7 shrink-0 rounded bg-stone-100" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 truncate">
                                      {e.slotLabel}
                                    </span>
                                    <span className="text-xs font-medium text-stone-300 truncate">—</span>
                                  </div>
                                </div>
                              )
                        ))}
                        {overflow > 0 && (
                          <p className="text-xs text-stone-400 self-center">{t('overflow', { count: overflow })}</p>
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
    <div className="rounded-xl squircle shadow-sm bg-white px-5 py-6 text-center">
      <p className="text-sm font-medium text-stone-700 mb-1">{t('planYourWeek')}</p>
      <p className="text-xs text-stone-400 mb-3">{t('addMealsCta')}</p>
      <Link href="/meal-planner" className="text-xs font-medium text-primary-500 hover:underline">
        {t('goToPlanner')}
      </Link>
    </div>
  );
};
