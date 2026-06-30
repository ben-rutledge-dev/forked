import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
// Components
import { GrocerySection } from './components/GrocerySection';
import { MealPlanStripSection } from './components/MealPlanStripSection';
import { RecipesListSection } from './components/RecipesListSection';
import { TonightSpotlightSection } from './components/TonightSpotlightSection';
import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/Typography';
// Lib
import { auth } from '@/lib/auth';

export const metadata: Metadata = { title: 'Dashboard' };

const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

const addDaysStr = (dateStr: string, days: number) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().split('T')[0];
};

const startOfWeek = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return addDaysStr(dateStr, dow === 0 ? -6 : 1 - dow);
};

const DashboardPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const t = await getTranslations('dashboard');
  const userId = session.user.id;
  const todayStr = toDateStr(new Date());
  const mondayStr = startOfWeek(todayStr);
  const sundayStr = addDaysStr(mondayStr, 6);
  const endStr = addDaysStr(todayStr, 6);

  return (
    <PageLayout>
      {/* Tonight spotlight */}
      <section className="mb-10">
        <Suspense fallback={<div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 animate-pulse h-72" />}>
          <TonightSpotlightSection userId={userId} todayStr={todayStr} endStr={endStr} />
        </Suspense>
      </section>

      {/* Meal plan strip */}
      <section className="mb-10">
        <SectionHeading className="mb-3">{t('thisWeek')}</SectionHeading>
        <Suspense fallback={(
          <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 divide-y divide-stone-100 dark:divide-stone-700 px-5 overflow-hidden">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="py-3 flex gap-5">
                <div className="w-10 shrink-0 space-y-1.5">
                  <div className="h-2.5 rounded bg-stone-100 dark:bg-stone-700 animate-pulse" />
                  <div className="h-4 rounded bg-stone-100 dark:bg-stone-700 animate-pulse" />
                </div>
                <div className="flex-1 flex gap-2">
                  {i % 2 === 0 && <div className="h-11 w-36 rounded-lg bg-stone-100 dark:bg-stone-700 animate-pulse" />}
                  {i % 3 !== 1 && <div className="h-11 w-36 rounded-lg bg-stone-100 dark:bg-stone-700 animate-pulse" />}
                </div>
              </div>
            ))}
          </div>
        )}
        >
          <MealPlanStripSection userId={userId} startDateStr={mondayStr} endStr={sundayStr} />
        </Suspense>
      </section>

      {/* Grocery */}
      <section className="mb-10">
        <Suspense fallback={<div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 animate-pulse h-48" />}>
          <GrocerySection userId={userId} todayStr={todayStr} endStr={endStr} />
        </Suspense>
      </section>

      {/* Recipes */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <SectionHeading>{t('myRecipes')}</SectionHeading>
          <Link href="/recipes?tab=recipes" className="text-xs font-medium text-primary-500 hover:underline">{t('seeAll')}</Link>
        </div>
        <Suspense fallback={(
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse h-44" />
            ))}
          </div>
        )}
        >
          <RecipesListSection userId={userId} />
        </Suspense>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
