'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
// Data
import { usePostDismissSuggestion } from '@/data/dashboard/suggestions';
import { usePostItems } from '@/data/shopping-lists/[shoppingListId]/items';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
// Components
import { Button } from '@/components/Button';
import { DismissibleChip } from '@/components/DismissibleChip';
import { Toast } from '@/components/Toast';
import { SectionHeading } from '@/components/Typography';

type ToastState
  = | { type: 'skip', ingredient: string, key: number }
    | { type: 'standard', message: string }
    | null;

type Props = {
  suggestions: string[]
  userId: string
  selectedListId: string | null
  selectedListName: string | null
};

export const SuggestionsSection = ({ suggestions: initialSuggestions, userId, selectedListId, selectedListName }: Props) => {
  const t = useTranslations('dashboard.suggestions');
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [selected, setSelected] = useState(new Set<string>());
  const [submitting, setSubmitting] = useState(false);
  const [activeToast, setActiveToast] = useState<ToastState>(null);
  const skipToastKeyRef = useRef(0);
  const sectionIdRef = useRef<string | null>(null);
  const pendingSectionFetch = useRef<Promise<string | null>>(Promise.resolve(null));

  const { confirm } = useConfirm();
  const { mutate: dismiss } = usePostDismissSuggestion();
  const { mutateAsync: postItems } = usePostItems({ shoppingListId: selectedListId ?? undefined });

  useEffect(() => {
    if (!selectedListId) {
      sectionIdRef.current = null;
      return;
    }
    pendingSectionFetch.current = fetch(`/api/shopping-lists/${selectedListId}`)
      .then(r => r.json())
      .then((data: { sections?: Array<{ id: string }> }) => {
        const id = data.sections?.[0]?.id ?? null;
        sectionIdRef.current = id;
        return id;
      })
      .catch(() => null);
  }, [selectedListId]);

  const toggleSelected = (ingredient: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) next.delete(ingredient);
      else next.add(ingredient);
      return next;
    });
  };

  const handleSkip = (ingredient: string) => {
    setSuggestions(s => s.filter(i => i !== ingredient));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(ingredient);
      return next;
    });
    dismiss({ ingredientName: ingredient, permanent: false, userId });
    skipToastKeyRef.current += 1;
    setActiveToast({ type: 'skip', ingredient, key: skipToastKeyRef.current });
  };

  const handleAlwaysSkip = async (ingredient: string) => {
    setActiveToast(null);
    const confirmed = await confirm(
      t('neverSuggestConfirm', { ingredient }),
      { confirmLabel: t('neverSuggestConfirmLabel') },
    );
    if (!confirmed) return;
    dismiss({ ingredientName: ingredient, permanent: true, userId });
    setActiveToast({ type: 'standard', message: t('alwaysSkipToast', { ingredient }) });
  };

  const handleAddSelected = async () => {
    if (!selectedListId || selected.size === 0) return;
    const sectionId = sectionIdRef.current ?? await pendingSectionFetch.current;
    if (!sectionId) {
      setActiveToast({ type: 'standard', message: t('couldNotReach') });
      return;
    }
    setSubmitting(true);
    try {
      const addedArr = Array.from(selected);
      await postItems({ items: addedArr.map(name => ({ name, sectionId })) });
      setSuggestions(s => s.filter(i => !addedArr.includes(i)));
      setSelected(new Set());
      for (const name of addedArr) {
        dismiss({ ingredientName: name, permanent: false, userId });
      }
      setActiveToast({ type: 'standard', message: t('addedToast') });
    }
    catch {
      setActiveToast({ type: 'standard', message: t('failedToAdd') });
    }
    finally {
      setSubmitting(false);
    }
  };

  const buttonLabel = (() => {
    if (submitting) return t('adding');
    if (selected.size > 0 && selectedListName) return t('addButtonCount', { count: selected.size, listName: selectedListName });
    if (selected.size > 0) return t('addButtonCountGeneric', { count: selected.size });
    return t('addButton');
  })();

  const header = (
    <div className="mb-4">
      <SectionHeading>{t('heading')}</SectionHeading>
      <p className="text-xs text-stone-400 mt-0.5">{t('tagline')}</p>
    </div>
  );

  const addButton = (
    <Button
      variant="primary"
      size="md"
      disabled={selected.size === 0 || !selectedListId || submitting}
      onClick={handleAddSelected}
    >
      {buttonLabel}
    </Button>
  );

  if (suggestions.length === 0) {
    return (
      <>
        {header}
        <p className="text-sm text-stone-400">{t('emptyPantry')}</p>
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {activeToast?.type === 'skip' && (
        <Toast
          key={activeToast.key}
          message={t('skipToast', { ingredient: activeToast.ingredient })}
          onDismiss={() => setActiveToast(null)}
          duration={6000}
          action={{
            label: t('neverSuggestConfirmLabel'),
            onClick: () => handleAlwaysSkip(activeToast.ingredient),
          }}
        />
      )}
      {activeToast?.type === 'standard' && (
        <Toast
          message={activeToast.message}
          onDismiss={() => setActiveToast(null)}
        />
      )}

      {header}

      <div className="flex flex-wrap gap-2">
        {suggestions.map(ingredient => (
          <DismissibleChip
            key={ingredient}
            label={ingredient}
            selected={selected.has(ingredient)}
            onToggle={() => toggleSelected(ingredient)}
            onSkip={() => handleSkip(ingredient)}
            onAlwaysSkip={() => handleAlwaysSkip(ingredient)}
          />
        ))}
      </div>

      <div className="mt-auto pt-4">
        {addButton}
      </div>
    </div>
  );
};
