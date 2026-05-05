'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';

export const DeleteButton = ({ recipeId }: { recipeId: string }) => {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
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
