'use client';

import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
// Data
import { useDeleteRecipe } from '@/data/recipes/[recipeId]';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
import { useModal } from '@/hooks/useModal';
// Components
import { AddToShoppingListModal } from '@/components/AddToShoppingListModal';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card, CardAction } from '@/components/Card';
import { ForkIcon } from '@/components/ForkIcon';
import { DotsHorizontalIcon, EditIcon, HeartIcon, RecipeIcon } from '@/components/Icons';
import { Toast } from '@/components/Toast';

type BookOption = { id: string, title: string };

type RecipeCardProps = {
  id: string
  title: string
  description: string | null
  coverImageUrl?: string | null
  forkCount: number
  isPublic?: boolean
  isOwned?: boolean
  forkedFromId?: string | null
  onVisibilityToggle?: (id: string, isPublic: boolean) => void
  onRemoveFromBook?: () => void
  /** Show pool-specific actions: favourite heart + add-to-book */
  showPoolActions?: boolean
  isFavourited?: boolean
};

export const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  description,
  coverImageUrl,
  forkCount,
  isPublic,
  isOwned,
  onRemoveFromBook,
  showPoolActions,
  isFavourited: initialIsFavourited,
}: RecipeCardProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const t = useTranslations('recipeCard');
  const [forking, setForking] = useState(false);
  const [iconAnimating, setIconAnimating] = useState(false);
  const pendingForkId = useRef<string | null>(null);

  const [addingToBook, setAddingToBook] = useState<string | null>(null);
  const [favourited, setFavourited] = useState(initialIsFavourited ?? false);
  const [togglingFavourite, setTogglingFavourite] = useState(false);

  const [books, setBooks] = useState<BookOption[] | null>(null);
  const [shoppingToast, setShoppingToast] = useState<string | null>(null);
  const { mutate: deleteRecipe, isPending: deleting } = useDeleteRecipe({ recipeId: id });
  const { modal } = useModal();

  const handleFork = async () => {
    if (!session) {
      signIn();
      return;
    }
    setForking(true);
    setIconAnimating(true);
    try {
      const res = await fetch(`/api/recipes/${id}/fork`, { method: 'POST' });
      if (res.ok) {
        const fork = await res.json();
        pendingForkId.current = fork.id;
      }
    }
    finally {
      setForking(false);
    }
  };

  const handleAnimationDone = () => {
    setIconAnimating(false);
    if (pendingForkId.current) {
      router.push(`/recipes/${pendingForkId.current}/edit`);
      pendingForkId.current = null;
    }
  };

  const handleToggleFavourite = async () => {
    if (!session) {
      signIn();
      return;
    }
    if (togglingFavourite) return;
    const next = !favourited;
    setFavourited(next);
    setTogglingFavourite(true);
    try {
      await fetch(`/api/recipes/${id}/favourite`, {
        method: next ? 'POST' : 'DELETE',
      });
    }
    catch {
      setFavourited(!next);
    }
    finally {
      setTogglingFavourite(false);
    }
  };

  const handleOpenAddToBook = async () => {
    if (books) return;
    const res = await fetch('/api/recipe-books');
    if (res.ok) {
      const data = await res.json();
      setBooks((data.books as BookOption[]) ?? []);
    }
    else {
      setBooks([]);
    }
  };

  const handleAddToBook = async (bookId: string) => {
    setAddingToBook(bookId);
    try {
      await fetch(`/api/recipe-books/${bookId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: id }),
      });
    }
    finally {
      setAddingToBook(null);
    }
  };

  const handleDelete = async () => {
    if (!await confirm('Delete this recipe? This cannot be undone.', { confirmLabel: t('delete') })) return;
    deleteRecipe();
  };

  const handleAddToShoppingList = async () => {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) return;
    const recipe = await res.json();
    const ingredients = (recipe.ingredients ?? []).map((ing: { id: string, name: string }) => ({
      id: ing.id,
      name: ing.name,
    }));
    const result = await modal<{ success: boolean, count: number, listName: string } | null>({
      Component: AddToShoppingListModal as React.FC<Record<string, unknown>>,
      props: { recipeId: id, recipeTitle: title, ingredients },
      maxWidth: 'max-w-md',
    });
    if (result?.success) {
      setShoppingToast(`Added ${result.count} item${result.count !== 1 ? 's' : ''} to ${result.listName}`);
    }
  };

  const href = `/recipes/${id}`;
  const PlaceholderIcon = <RecipeIcon className="w-10 h-10 text-stone-300" />;

  const cardActions: CardAction[] = [
    // Pool: heart/favourite button
    ...(showPoolActions && !isOwned
      ? [{
          title: favourited ? t('unfavourite') : t('favourite'),
          Icon: (
            <HeartIcon
              className={`w-3.5 h-3.5 ${favourited ? 'text-red-500' : ''}`}
              filled={favourited}
            />
          ),
          onClick: handleToggleFavourite,
        }]
      : []),
    // Owned: edit button
    ...(isOwned
      ? [{
          title: t('editRecipe'),
          Icon: <EditIcon className="w-3.5 h-3.5" />,
          onClick: () => router.push(`/recipes/${id}/edit`),
        }]
      : []),
    // Owned or in-book: more actions (add to book / remove / delete)
    ...(session && (onRemoveFromBook || isOwned)
      ? [{
          title: t('moreActions'),
          Icon: <DotsHorizontalIcon className="w-3.5 h-3.5" />,
          menuItems: [
            ...(onRemoveFromBook
              ? [{
                  label: t('removeFromBook'),
                  onClick: async () => {
                    if (await confirm('Remove this recipe from the book?', { confirmLabel: t('remove') })) {
                      onRemoveFromBook();
                    }
                  },
                }]
              : [{
                  label: t('addToBook'),
                  subMenu: {
                    title: t('addToBook'),
                    emptyLabel: t('noBooksYet'),
                    items: books
                      ? books.map(b => ({
                          label: b.title,
                          onClick: () => handleAddToBook(b.id),
                          disabled: addingToBook === b.id,
                        }))
                      : null,
                    onOpen: handleOpenAddToBook,
                  },
                }]),
            {
              label: 'Add to shopping list',
              onClick: handleAddToShoppingList,
            },
            ...(isOwned && !onRemoveFromBook
              ? [{
                  label: deleting ? t('deleting') : t('moveToTrash'),
                  onClick: handleDelete,
                  disabled: deleting,
                }]
              : []),
          ],
        }]
      : []),
    // Pool: more actions (add to book)
    ...(showPoolActions && !isOwned && session
      ? [{
          title: t('moreActions'),
          Icon: <DotsHorizontalIcon className="w-3.5 h-3.5" />,
          menuItems: [{
            label: t('addToBook'),
            subMenu: {
              title: t('addToBook'),
              emptyLabel: t('noBooksYet'),
              items: books
                ? books.map(b => ({
                    label: b.title,
                    onClick: () => handleAddToBook(b.id),
                    disabled: addingToBook === b.id,
                  }))
                : null,
              onOpen: handleOpenAddToBook,
            },
          }],
        }]
      : []),
  ];

  return (
    <>
      {shoppingToast && <Toast message={shoppingToast} onDismiss={() => setShoppingToast(null)} />}
      <Card href={href} coverImageUrl={coverImageUrl} CoverPlaceholderIcon={PlaceholderIcon} actions={cardActions}>
        <div className="flex-1">
          <h3 className="font-semibold text-stone-900 line-clamp-2">{title}</h3>
          {description && <p className="mt-1 text-sm text-stone-500 line-clamp-2">{description}</p>}
        </div>
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>
            {t('forks', { count: forkCount })}
          </span>
          {isOwned
            ? (
                <Badge variant={isPublic ? 'success' : 'neutral'}>
                  {isPublic ? t('public') : t('private')}
                </Badge>
              )
            : (
                <Button variant="primary" size="sm" shape="pill" disabled={forking} onClick={handleFork} className="flex items-center gap-1.5">
                  {forking ? t('forking') : t('fork')}
                  <ForkIcon animating={iconAnimating} onDone={handleAnimationDone} size={12} />
                </Button>
              )}
        </div>
      </Card>
    </>
  );
};
