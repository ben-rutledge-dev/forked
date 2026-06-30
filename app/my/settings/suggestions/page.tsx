import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
// Components
import { DismissalsList } from './components/DismissalsList';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Settings — Suggestions' };

const SuggestionsPage = async () => {
  const session = await auth();
  const t = await getTranslations('settings');

  const dismissals = await prisma.mealPlanSuggestionDismissal.findMany({
    where: { userId: session!.user.id, expiresAt: null },
    select: { ingredientName: true, createdAt: true },
    orderBy: { ingredientName: 'asc' },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
          {t('suggestionsHeading')}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">{t('suggestionsDescription')}</p>
      </div>
      <DismissalsList
        initialDismissals={dismissals.map(d => ({
          ingredientName: d.ingredientName,
          createdAt: d.createdAt.toISOString(),
        }))}
      />
    </div>
  );
};

export default SuggestionsPage;
