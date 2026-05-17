'use client';

import { useTranslations } from 'next-intl';
// Data
import { useDeleteRecipeBook } from '@/data/recipe-books/[recipeBookId]';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
// Components
import { Badge } from '@/components/Badge';
import { Card, CardAction } from '@/components/Card';
import { BookIcon, DotsHorizontalIcon } from '@/components/Icons';
import { UserBadge } from '@/components/UserBadge';
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

  const PlaceholderIcon = <BookIcon className="w-10 h-10 text-stone-300" />;

  const removeLabel = (() => {
    if (removing) return t('removing');
    return role === OWNER ? t('removeFromCollection') : t('leaveBook');
  })();

  const cardActions: CardAction[] = [{
    title: 'More actions',
    Icon: <DotsHorizontalIcon className="w-3.5 h-3.5" />,
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
            <UserBadge role={role} />
          )}
        </div>
      </div>
    </Card>
  );
};
