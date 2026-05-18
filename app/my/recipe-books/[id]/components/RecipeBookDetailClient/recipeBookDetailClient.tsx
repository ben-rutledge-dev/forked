'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Data
import { queryKeys } from '@/data/queryKeys';
import type { RecipeBookDetail } from '@/data/recipe-books/[recipeBookId]/types';
import { useQueryClient } from '@/data/shared/hooks';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
import { useModal } from '@/hooks/useModal';
// Components
import { AddRecipeModal } from './components/AddRecipeModal';
import { BookRecipesSection } from './components/BookRecipesSection';
import { RecipeBookEditForm } from './components/RecipeBookEditForm';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { InviteModal } from '@/components/Invites';
import { MembersSection } from '@/components/MembersSection';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { Toast } from '@/components/Toast';
import { UserBadge } from '@/components/UserBadge';
// Types
import type { Recipe } from '@/types';
// Utils
import { OWNER } from '@/utils/roles';

type Props = {
  book: RecipeBookDetail
  currentUserId: string
  isPremium: boolean
  userRecipes: Pick<Recipe, 'id' | 'title' | 'coverImageUrl'>[]
};

export const RecipeBookDetailClient: React.FC<Props> = (props) => {
  const { book: initialBook, currentUserId, isPremium, userRecipes } = props;
  const router = useRouter();
  const t = useTranslations('recipeBooks');
  const [book, setBook] = useState<RecipeBookDetail>(initialBook);
  const [toast, setToast] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const isOwner = book.currentUserRole === OWNER;
  const isMember = book.currentUserRole !== null;

  const { confirm } = useConfirm();
  const { modal } = useModal();
  const queryClient = useQueryClient();

  const handleRemoveEntry = async (entryId: string) => {
    const res = await fetch(`/api/recipe-books/${book.id}/entries/${entryId}`, { method: 'DELETE' });
    if (res.ok) {
      setBook(b => ({ ...b, entries: b.entries.filter(e => e.id !== entryId) }));
    }
  };

  const handleMove = async (entryId: string, direction: 'up' | 'down') => {
    const sorted = [...book.entries].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex(e => e.id === entryId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const updated = sorted.map((e, i) => {
      if (i === idx) return { ...e, orderIndex: sorted[swapIdx].orderIndex };
      if (i === swapIdx) return { ...e, orderIndex: sorted[idx].orderIndex };
      return e;
    });

    const res = await fetch(`/api/recipe-books/${book.id}/entries/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: updated.map(e => ({ id: e.id, orderIndex: e.orderIndex })) }),
    });
    if (res.ok) {
      setBook(b => ({ ...b, entries: updated }));
    }
  };

  const handleAddRecipe = async () => {
    const recipeId = await modal<string | null, React.ComponentProps<typeof AddRecipeModal>>({
      Component: AddRecipeModal,
      props: {
        userRecipes,
        existingRecipeIds: book.entries.map(e => e.recipe.id),
      },
      maxWidth: 'max-w-sm',
      cancelValue: null,
    });
    if (!recipeId) return;
    const res = await fetch(`/api/recipe-books/${book.id}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId }),
    });
    if (res.ok) {
      const recipe = userRecipes.find(r => r.id === recipeId);
      if (!recipe) return;
      const newEntry = await res.json();
      setBook(b => ({
        ...b,
        entries: [
          ...b.entries,
          {
            id: newEntry.id,
            recipeBookId: book.id,
            recipeId,
            addedByUserId: currentUserId,
            orderIndex: newEntry.orderIndex,
            createdAt: newEntry.createdAt,
            recipe: { ...recipe, description: null, forkCount: 0, isPublic: false, authorId: currentUserId },
          },
        ],
      }));
      setToast(t('recipeAdded'));
    }
  };

  const handleInvite = async () => {
    const result = await modal<true | null, React.ComponentProps<typeof InviteModal>>({
      Component: InviteModal,
      props: {
        heading: t('inviteHeading'),
        isPremium,
        onSubmit: async (username: string, role: 'OWNER' | 'COLLABORATOR') => {
          const res = await fetch(`/api/recipe-books/${book.id}/invites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, role }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? 'Failed');
        },
      },
      maxWidth: 'max-w-sm',
      cancelValue: null,
    });
    if (!result) return;
    const bookRes = await fetch(`/api/recipe-books/${book.id}`);
    if (bookRes.ok) {
      const updated = await bookRes.json();
      setBook(updated);
    }
    setToast(t('inviteSent'));
  };

  const handleRemoveMember = async (userId: string) => {
    if (!await confirm(t('removeCollaborator'), { confirmLabel: t('confirmRemoveLabel') })) return;
    const res = await fetch(`/api/recipe-books/${book.id}/members/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setBook(b => ({ ...b, members: b.members.filter(m => m.userId !== userId) }));
    }
  };

  const handleDelete = async (message: string) => {
    if (!await confirm(message, { confirmLabel: isOwner ? t('confirmRemoveLabel') : t('confirmLeaveLabel') })) return;
    const res = await fetch(`/api/recipe-books/${book.id}`, { method: 'DELETE' });
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.recipeBooks.mine() });
      router.push('/my/recipe-books');
    }
  };

  return (
    <PageLayout>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {book.coverImageUrl && (
        <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative">
          <Image src={book.coverImageUrl} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 896px" />
        </div>
      )}

      <PageHeader
        title={book.title}
        backHref="/my/recipes?tab=books"
        subtitle={book.description ?? undefined}
        action={<BookHeaderAction book={book} isOwner={isOwner} onEditToggle={() => setShowEditForm(v => !v)} />}
      />

      {showEditForm && isOwner && (
        <RecipeBookEditForm
          book={book}
          onSaved={(updated) => {
            setBook(b => ({ ...b, ...updated }));
            setToast('Saved!');
            setShowEditForm(false);
          }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      <BookRecipesSection
        entries={book.entries}
        isMember={isMember}
        currentUserId={currentUserId}
        onAddRecipe={handleAddRecipe}
        onRemoveEntry={handleRemoveEntry}
        onMove={handleMove}
      />

      <MembersSection
        members={book.members}
        isOwner={isOwner}
        currentUserId={currentUserId}
        onInvite={handleInvite}
        onRemoveMember={handleRemoveMember}
      />

      <div className="mt-10 pt-6 border-t border-stone-100 flex gap-3">
        {isOwner
          ? (
              <Button variant="danger" size="sm" onClick={() => handleDelete(t('removeFromCollectionConfirm'))}>
                {t('removeFromCollection')}
              </Button>
            )
          : (
              <Button variant="danger" size="sm" onClick={() => handleDelete(t('leaveBookConfirm'))}>
                {t('leaveBook')}
              </Button>
            )}
      </div>
    </PageLayout>
  );
};

type BookHeaderActionProps = {
  book: RecipeBookDetail
  isOwner: boolean
  onEditToggle: () => void
};

const BookHeaderAction: React.FC<BookHeaderActionProps> = (props) => {
  const { book, isOwner, onEditToggle } = props;
  const t = useTranslations('recipeBooks');
  return (
    <div className="flex items-center gap-2">
      <Badge variant={book.isPublic ? 'success' : 'neutral'} className="text-xs font-medium">
        {book.isPublic ? t('public') : t('private')}
      </Badge>
      {book.currentUserRole && (
        <UserBadge role={book.currentUserRole} />
      )}
      {isOwner && (
        <Button variant="secondary" size="sm" shape="pill" onClick={onEditToggle}>
          {t('edit')}
        </Button>
      )}
    </div>
  );
};
