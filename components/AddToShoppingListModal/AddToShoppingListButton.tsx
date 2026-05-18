'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Hooks
import { useModal } from '@/hooks/useModal';
// Components
import { AddToShoppingListModal } from '@/components/AddToShoppingListModal';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';

type Props = {
  recipeId: string
  recipeTitle: string
};

export const AddToShoppingListButton = ({ recipeId, recipeTitle }: Props) => {
  const { modal } = useModal();
  const t = useTranslations('addToShoppingList');
  const [toast, setToast] = useState<string | null>(null);

  const handleClick = async () => {
    const result = await modal<{ success: boolean, count: number, listName: string } | null>({
      Component: AddToShoppingListModal as React.FC<Record<string, unknown>>,
      props: { recipeId, recipeTitle },
      maxWidth: 'max-w-md',
    });

    if (result?.success) {
      setToast(t('addedToast', { count: result.count, listName: result.listName }));
    }
  };

  return (
    <>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      <Button
        variant="secondary"
        size="sm"
        shape="pill"
        onClick={handleClick}
      >
        {t('buttonLabel')}
      </Button>
    </>
  );
};
