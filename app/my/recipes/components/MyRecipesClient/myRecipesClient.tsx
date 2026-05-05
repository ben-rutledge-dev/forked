'use client';

import Link from 'next/link';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { RecipeBookCard } from '@/components/RecipeBookCard';
import { RecipeCard } from '@/components/RecipeCard';
// Types
import type { Recipe } from '@/types';
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

type Props = {
  initialRecipes: Recipe[]
  initialBooks: Book[]
  initialPending: PendingInvite[]
  defaultTab?: 'recipes' | 'books'
};

const PAGE_SIZE = 12;

export const MyRecipesClient = ({ initialRecipes, initialBooks, initialPending, defaultTab = 'recipes' }: Props) => {
  const [tab, setTab] = useState<'recipes' | 'books'>(defaultTab);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState(initialBooks);
  const [pending, setPending] = useState(initialPending);
  const [acting, setActing] = useState<string | null>(null);

  const handleVisibilityToggle = (id: string, isPublic: boolean) => {
    setRecipes(prev => prev.map(r => (r.id === id ? { ...r, isPublic } : r)));
  };

  const handleAccept = async (invite: PendingInvite) => {
    setActing(invite.id);
    try {
      const res = await fetch(`/api/recipe-books/${invite.recipeBook.id}/invites/accept`, { method: 'POST' });
      if (res.ok) {
        setPending(p => p.filter(i => i.id !== invite.id));
        setBooks(b => [
          ...b,
          { id: invite.recipeBook.id, title: invite.recipeBook.title, coverImageUrl: invite.recipeBook.coverImageUrl, isPublic: false, role: invite.role, memberCount: 1, recipeCount: 0 },
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
      const res = await fetch(`/api/recipe-books/${invite.recipeBook.id}/invites/decline`, { method: 'POST' });
      if (res.ok) setPending(p => p.filter(i => i.id !== invite.id));
    }
    finally {
      setActing(null);
    }
  };

  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const visible = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">My Recipes</h1>
        {tab === 'recipes'
          ? (
              <Link
                href="/my/recipes/new"
                className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                + New recipe
              </Link>
            )
          : (
              <Link
                href="/my/recipe-books/new"
                className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                + New recipe book
              </Link>
            )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-stone-200">
        {(['recipes', 'books'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {t === 'recipes' ? 'Recipes' : 'Recipe Books'}
            {t === 'books' && pending.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary-500 px-1.5 py-0.5 text-xs text-white">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'recipes' && (
        recipes.length === 0
          ? (
              <div className="text-center py-20 text-stone-400">
                <p>No recipes yet.</p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <Link href="/my/recipes/new" className="text-stone-700 underline hover:text-stone-900">Create one</Link>
                  <span className="text-stone-300">or</span>
                  <Link href="/pool" className="text-stone-700 underline hover:text-stone-900">fork from the pool</Link>
                </div>
              </div>
            )
          : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visible.map(r => (
                    <RecipeCard
                      key={r.id}
                      id={r.id}
                      title={r.title}
                      description={r.description}
                      coverImageUrl={r.coverImageUrl}
                      forkCount={r.forkCount}
                      isPublic={r.isPublic}
                      isOwned
                      forkedFromId={r.forkedFromId}
                      onVisibilityToggle={handleVisibilityToggle}
                    />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )
      )}

      {tab === 'books' && (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Pending invites</h2>
              <div className="space-y-3">
                {pending.map(invite => (
                  <div key={invite.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4">
                    <div>
                      <p className="font-medium text-stone-900">{invite.recipeBook.title}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Invited as
                        <span className="font-medium">{invite.role}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" shape="pill" disabled={acting === invite.id} onClick={() => handleAccept(invite)}>Accept</Button>
                      <Button variant="secondary" size="sm" shape="pill" disabled={acting === invite.id} onClick={() => handleDecline(invite)}>Decline</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {books.length === 0
            ? (
                <div className="text-center py-20 text-stone-400">
                  <p>No recipe books yet.</p>
                  <Link href="/my/recipe-books/new" className="mt-4 inline-block text-stone-700 underline hover:text-stone-900">Create one</Link>
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
                      onRemove={() => setBooks(prev => prev.filter(x => x.id !== b.id))}
                    />
                  ))}
                </div>
              )}
        </>
      )}
    </div>
  );
};
