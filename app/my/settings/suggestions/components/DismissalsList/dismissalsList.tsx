'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Dismissal = {
  ingredientName: string
  createdAt: string
};

export const DismissalsList = ({ initialDismissals }: { initialDismissals: Dismissal[] }) => {
  const t = useTranslations('settings');
  const [dismissals, setDismissals] = useState(initialDismissals);
  const [restoringSet, setRestoringSet] = useState<Set<string>>(new Set());

  const handleRestore = async (ingredientName: string) => {
    setRestoringSet(prev => new Set(prev).add(ingredientName));
    try {
      await fetch('/api/dashboard/suggestions/dismiss', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientName }),
      });
      setDismissals(prev => prev.filter(d => d.ingredientName !== ingredientName));
    }
    finally {
      setRestoringSet((prev) => {
        const next = new Set(prev);
        next.delete(ingredientName);
        return next;
      });
    }
  };

  if (dismissals.length === 0) {
    return (
      <p className="text-sm text-stone-500 dark:text-stone-400 py-4">{t('noDismissals')}</p>
    );
  }

  return (
    <ul className="divide-y divide-stone-100 dark:divide-stone-700 rounded-xl squircle shadow-sm dark:shadow-stone-950/30 bg-white dark:bg-stone-800 overflow-hidden">
      {dismissals.map(({ ingredientName }) => {
        const isRestoring = restoringSet.has(ingredientName);
        return (
          <li
            key={ingredientName}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <span className="text-sm text-stone-900 dark:text-stone-100 capitalize">{ingredientName}</span>
            <button
              type="button"
              disabled={isRestoring}
              onClick={() => handleRestore(ingredientName)}
              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {isRestoring ? t('restoring') : t('restore')}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
