'use client';

import { useTranslations } from 'next-intl';
// Data
import { useDeleteRecipeBook } from '@/data/recipe-books/[recipeBookId]';
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
}: Props) => {
  const { confirm } = useConfirm();
  const { mutate: deleteBook, isPending: removing } = useDeleteRecipeBook({ recipeBookId: id });
  const t = useTranslations('recipeBookCard');
  const target = href ?? `/my/recipe-books/${id}`;

  const handleRemove = async () => {
    const label = role === OWNER ? t('confirmRemove') : t('confirmLeave');
    if (!await confirm(label, { confirmLabel: role === OWNER ? t('confirmRemoveLabel') : t('confirmLeaveLabel') })) return;
    deleteBook();
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

  const removeLabel = removing ? t('removing') : role === OWNER ? t('removeFromCollection') : t('leaveBook');

  const cardActions: CardAction[] = [{
    title: 'More actions',
    Icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </svg>
    ),
    menuItems: [{
      label: removeLabel,
      onClick: handleRemove,
      disabled: removing,
    }],
  }];

  return (
    <Card href={target} coverImageUrl={coverImageUrl} CoverPlaceholderIcon={PlaceholderIcon} actions={cardActions}>
      <div className="flex-1">
        <h3 className="font-semibold text-stone-900 line-clamp-2">{title}</h3>
      </div>
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>
          {t('count', { recipes: recipeCount, members: memberCount })}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge variant={isPublic ? 'success' : 'neutral'}>
            {isPublic ? t('public') : t('private')}
          </Badge>
          {role && (
            <Badge variant={role === OWNER ? 'primary' : 'neutral'}>{role}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
