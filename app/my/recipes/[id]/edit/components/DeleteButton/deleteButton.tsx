'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';

export const DeleteButton = ({ recipeId }: { recipeId: string }) => {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!await confirm('Delete this recipe? This cannot be undone.', { confirmLabel: 'Delete' })) return;
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
      {deleting ? 'Deleting…' : 'Delete'}
    </Button>
  );
};
