'use client';

import { useState } from 'react';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
// Components
import { Badge } from '@/components/Badge';
import { Card, CardAction } from '@/components/Card';
// Utils
import { OWNER, type Role } from '@/utils/roles';

type Props = {
  id: string
  title: string
  coverImageUrl?: string | null
  recipeCount: number
  memberCount: number
  isPublic: boolean
  role?: Role
  href?: string
  onRemove?: () => void
};

export const RecipeBookCard = ({
  id,
  title,
  coverImageUrl,
  recipeCount,
  memberCount,
  isPublic,
  role,
  href,
  onRemove,
}: Props) => {
  const [removing, setRemoving] = useState(false);
  const { confirm } = useConfirm();
  const target = href ?? `/my/recipe-books/${id}`;

  const handleRemove = async () => {
    const label = role === OWNER ? 'Remove this book from your collection?' : 'Leave this recipe book?';
    if (!await confirm(label, { confirmLabel: role === OWNER ? 'Remove' : 'Leave' })) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/recipe-books/${id}`, { method: 'DELETE' });
      if (res.ok) onRemove?.();
    }
    finally {
      setRemoving(false);
    }
  };

  const PlaceholderIcon = (
    <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );

  const cardActions: CardAction[] | undefined = onRemove
    ? [{
        title: 'More actions',
        Icon: (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        ),
        menuItems: [{
          label: removing ? 'Removing…' : role === OWNER ? 'Remove from collection' : 'Leave book',
          onClick: handleRemove,
          disabled: removing,
        }],
      }]
    : undefined;

  return (
    <Card href={target} coverImageUrl={coverImageUrl} CoverPlaceholderIcon={PlaceholderIcon} actions={cardActions}>
      <div className="flex-1">
        <h3 className="font-semibold text-stone-900 line-clamp-2">{title}</h3>
      </div>
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>
          {recipeCount}
          {' '}
          {recipeCount === 1 ? 'recipe' : 'recipes'}
          {' '}
          ·
          {' '}
          {memberCount}
          {' '}
          {memberCount === 1 ? 'member' : 'members'}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge variant={isPublic ? 'success' : 'neutral'}>
            {isPublic ? 'public' : 'private'}
          </Badge>
          {role && (
            <Badge variant="primary">{role}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
