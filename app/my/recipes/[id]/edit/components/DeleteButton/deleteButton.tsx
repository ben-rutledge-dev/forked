'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
// Components
import { Button } from '@/components/Button';

export const DeleteButton = ({ recipeId }: { recipeId: string }) => {
  const router = useRouter();
  const { confirm } = useConfirm();
  const t = useTranslations('common');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!await confirm('Delete this recipe? This cannot be undone.', { confirmLabel: t('delete') })) return;
    setDeleting(true);
    try {
      await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE' });
      router.push('/my/recipes');
    }
    finally {
      setDeleting(false);
    }
  };

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
      {deleting ? t('deleting') : t('delete')}
    </Button>
  );
};
