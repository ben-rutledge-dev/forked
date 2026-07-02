'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { RecipeBookCard } from '@/components/RecipeBookCard';
import { PageHeading, SectionLabel } from '@/components/Typography';
// Utils
import { type Role } from '@/utils/roles';

type Book = {
  id: string
  title: string
  coverImageUrl: string | null
  isPublic: boolean
  role: Role
  memberCount: number
  recipeCount: number
};

type PendingInvite = {
  id: string
  role: Role
  recipeBook: { id: string, title: string, coverImageUrl: string | null }
  invitedByUserId: string
};

type RecipeBooksClientProps = {
  initialBooks: Book[]
  initialPending: PendingInvite[]
};

export const RecipeBooksClient: React.FC<RecipeBooksClientProps> = (props) => {
  const {
    initialBooks,
    initialPending } = props;
  const [books, setBooks] = useState(initialBooks);
  const [pending, setPending] = useState(initialPending);
  const [acting, setActing] = useState<string | null>(null);
  const t = useTranslations('recipeBooks');

  const handleAccept = async (invite: PendingInvite) => {
    setActing(invite.id);
    try {
      const res = await fetch(`/api/recipe-books/${invite.recipeBook.id}/invites/accept`, {
        method: 'POST',
      });
      if (res.ok) {
        setPending(p => p.filter(i => i.id !== invite.id));
        // Add a placeholder book entry until next full reload
        setBooks(b => [
          ...b,
          {
            id: invite.recipeBook.id,
            title: invite.recipeBook.title,
            coverImageUrl: invite.recipeBook.coverImageUrl,
            isPublic: false,
            role: invite.role,
            memberCount: 1,
            recipeCount: 0,
          },
        ]);
      }
    }
    finally {
      setActing(null);
    }
  };

  const handleDecline = async (invite: PendingInvite) => {
    setActing(invite.id);
    try {
      const res = await fetch(`/api/recipe-books/${invite.recipeBook.id}/invites/decline`, {
        method: 'POST',
      });
      if (res.ok) {
        setPending(p => p.filter(i => i.id !== invite.id));
      }
    }
    finally {
      setActing(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <PageHeading>{t('heading')}</PageHeading>
        <Link
          href="/my/recipe-books/new"
          className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          {t('newBookLink')}
        </Link>
      </div>

      {pending.length > 0 && (
        <section className="mb-10">
          <SectionLabel className="mb-4">
            {t('pendingInvites')}
          </SectionLabel>
          <div className="space-y-3">
            {pending.map(invite => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">{invite.recipeBook.title}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    {t('invitedAs')}
                    {' '}
                    <span className="font-medium">{invite.role}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"

                    disabled={acting === invite.id}
                    onClick={() => handleAccept(invite)}
                  >
                    {t('accept')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"

                    disabled={acting === invite.id}
                    onClick={() => handleDecline(invite)}
                  >
                    {t('decline')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {books.length === 0
        ? (
            <div className="text-center py-20 text-stone-400 dark:text-stone-500">
              <p>{t('noBooksYet')}</p>
              <Link href="/my/recipe-books/new" className="mt-4 inline-block text-stone-700 dark:text-stone-300 underline hover:text-stone-900 dark:hover:text-stone-100">
                {t('createBook')}
              </Link>
            </div>
          )
        : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map(b => (
                <RecipeBookCard
                  key={b.id}
                  id={b.id}
                  title={b.title}
                  coverImageUrl={b.coverImageUrl}
                  isPublic={b.isPublic}
                  role={b.role}
                  memberCount={b.memberCount}
                  recipeCount={b.recipeCount}
                />
              ))}
            </div>
          )}
    </div>
  );
};
