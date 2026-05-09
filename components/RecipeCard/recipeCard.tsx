'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
// Components
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card, CardAction } from '@/components/Card';
import { ForkIcon } from '@/components/ForkIcon';

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
  onDelete?: (id: string) => void
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
  onDelete,
}: RecipeCardProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [forking, setForking] = useState(false);
  const [iconAnimating, setIconAnimating] = useState(false);
  const pendingForkId = useRef<string | null>(null);

  const [addingToBook, setAddingToBook] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [books, setBooks] = useState<BookOption[] | null>(null);

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
      router.push(`/my/recipes/${pendingForkId.current}/edit`);
      pendingForkId.current = null;
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
    if (!await confirm('Delete this recipe? This cannot be undone.', { confirmLabel: 'Delete' })) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      if (res.ok) onDelete?.(id);
    }
    finally {
      setDeleting(false);
    }
  };

  const href = isOwned ? `/my/recipes/${id}` : `/recipes/${id}`;
  const PlaceholderIcon = (
    <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );

  const cardActions: CardAction[] = [
    ...(onRemoveFromBook
      ? [{
          title: 'Remove from Recipe Book',
          Icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          onClick: onRemoveFromBook,
        }]
      : []),
    ...(isOwned
      ? [{
          title: 'Edit recipe',
          Icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"
              />
            </svg>
          ),
          onClick: () => router.push(`/my/recipes/${id}/edit`),
        }]
      : []),
    ...(session
      ? [{
          title: 'More actions',
          Icon: (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          ),
          menuItems: [
            {
              label: 'Add to Recipe Book',
              subMenu: {
                title: 'Add to Recipe Book',
                emptyLabel: 'No recipe books yet.',
                items: books
                  ? books.map(b => ({
                      label: b.title,
                      onClick: () => handleAddToBook(b.id),
                      disabled: addingToBook === b.id,
                    }))
                  : null,
                onOpen: handleOpenAddToBook,
              },
            },
            ...(isOwned
              ? [{
                  label: deleting ? 'Deleting…' : 'Move to trash',
                  onClick: handleDelete,
                  disabled: deleting,
                }]
              : []),
          ],
        }]
      : []),
  ];

  return (
    <Card href={href} coverImageUrl={coverImageUrl} CoverPlaceholderIcon={PlaceholderIcon} actions={cardActions}>
      <div className="flex-1">
        <h3 className="font-semibold text-stone-900 line-clamp-2">{title}</h3>
        {description && <p className="mt-1 text-sm text-stone-500 line-clamp-2">{description}</p>}
      </div>
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>
          {forkCount}
          {' '}
          {forkCount === 1 ? 'fork' : 'forks'}
        </span>
        {isOwned
          ? (
              <Badge variant={isPublic ? 'success' : 'neutral'}>
                {isPublic ? 'public' : 'private'}
              </Badge>
            )
          : (
              <Button variant="primary" size="sm" shape="pill" disabled={forking} onClick={handleFork} className="flex items-center gap-1.5">
                {forking ? 'Forking…' : 'Fork'}
                <ForkIcon animating={iconAnimating} onDone={handleAnimationDone} size={12} />
              </Button>
            )}
      </div>
    </Card>
  );
};
