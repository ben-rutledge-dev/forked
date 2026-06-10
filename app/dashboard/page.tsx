import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
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

const DashboardPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const t = await getTranslations('dashboard');
  const userId = session.user.id;
  const todayStr = toDateStr(new Date());
  const endStr = addDaysStr(todayStr, 6);

  return (
    <PageLayout>
      {/* Tonight + grocery card — two independent Suspense boundaries */}
      <section className="mb-10">
        <Suspense fallback={<div className="rounded-xl border border-stone-200 bg-stone-50 animate-pulse h-72" />}>
          <TonightSpotlightSection userId={userId} todayStr={todayStr} endStr={endStr} />
        </Suspense>
        <Suspense fallback={<div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 animate-pulse h-48" />}>
          <GrocerySection userId={userId} todayStr={todayStr} endStr={endStr} />
        </Suspense>
      </section>

      {/* Meal plan strip */}
      <section className="mb-10">
        <SectionHeading className="mb-3">{t('thisWeek')}</SectionHeading>
        <Suspense fallback={(
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex-none w-44 rounded-xl bg-stone-100 animate-pulse h-32" />
            ))}
          </div>
        )}
        >
          <MealPlanStripSection userId={userId} todayStr={todayStr} endStr={endStr} />
        </Suspense>
      </section>

      {/* Recipes */}
      <section className="mb-10">
        <SectionHeading className="mb-3">{t('myRecipes')}</SectionHeading>
        <Suspense fallback={(
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex-none w-48 rounded-xl bg-stone-100 animate-pulse h-44" />
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
