'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';
import { ImageUpload } from '@/components/ImageUpload';
import { RecipeCard } from '@/components/RecipeCard';
import { Toast } from '@/components/Toast';
// Types
import type { Recipe } from '@/types';
// Utils
import { COLLABORATOR, OWNER, type Role } from '@/utils/roles';

type Entry = {
  id: string
  orderIndex: number
  recipe: Recipe
};

type Member = {
  id: string
  userId: string
  role: Role
  acceptedAt: string | null
  user: { id: string, name: string | null, username: string | null, avatarUrl: string | null }
};

type Book = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  isPublic: boolean
  entries: Entry[]
  members: Member[]
  currentUserRole: Role | null
};

type Props = {
  book: Book
  currentUserId: string
  isPremium: boolean
  userRecipes: Pick<Recipe, 'id' | 'title' | 'coverImageUrl'>[]
};

export const RecipeBookDetailClient = ({ book: initialBook, currentUserId, isPremium, userRecipes }: Props) => {
  const router = useRouter();
  const [book, setBook] = useState(initialBook);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Invite modal state
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>(COLLABORATOR);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Add recipe modal state
  const [recipeSearch, setRecipeSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState(book.title);
  const [editDescription, setEditDescription] = useState(book.description ?? '');
  const [editIsPublic, setEditIsPublic] = useState(book.isPublic);
  const [editCoverImageUrl, setEditCoverImageUrl] = useState(book.coverImageUrl ?? '');
  const [saving, setSaving] = useState(false);

  const isOwner = book.currentUserRole === OWNER;
  const isMember = book.currentUserRole !== null;

  const acceptedMembers = book.members.filter(m => m.acceptedAt !== null);
  const pendingMembers = book.members.filter(m => m.acceptedAt === null);

  const existingRecipeIds = new Set(book.entries.map(e => e.recipe.id));
  const addableRecipes = userRecipes.filter(
    r => !existingRecipeIds.has(r.id) && r.title.toLowerCase().includes(recipeSearch.toLowerCase()),
  );

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

  const handleAddRecipe = async (recipeId: string) => {
    setAdding(recipeId);
    try {
      const res = await fetch(`/api/recipe-books/${book.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) {
        const recipe = userRecipes.find(r => r.id === recipeId)!;
        const newEntry = await res.json();
        setBook(b => ({
          ...b,
          entries: [
            ...b.entries,
            {
              id: newEntry.id,
              orderIndex: newEntry.orderIndex,
              recipe: { ...recipe, description: null, forkCount: 0, isPublic: false, authorId: currentUserId, forkedFromId: null },
            },
          ],
        }));
        setToast('Recipe added!');
        setShowAddModal(false);
      }
    }
    finally {
      setAdding(null);
    }
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return;
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/recipe-books/${book.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inviteUsername.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error ?? 'Failed');
        return;
      }
      setToast(`Invite sent to @${inviteUsername.trim()}`);
      setShowInviteModal(false);
      setInviteUsername('');
      setInviteRole(COLLABORATOR);
    }
    finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this collaborator?')) return;
    const res = await fetch(`/api/recipe-books/${book.id}/members/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setBook(b => ({ ...b, members: b.members.filter(m => m.userId !== userId) }));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/recipe-books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription, isPublic: editIsPublic, coverImageUrl: editCoverImageUrl || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        return;
      }
      setBook(b => ({ ...b, title: editTitle, description: editDescription || null, isPublic: editIsPublic, coverImageUrl: editCoverImageUrl || null }));
      setToast('Saved!');
      setShowEditForm(false);
    }
    finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this recipe book?')) return;
    const res = await fetch(`/api/recipe-books/${book.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/my/recipe-books');
  };

  const handleRemoveFromCollection = async () => {
    if (!confirm('Remove this book from your collection? If you are the last owner, the book will be permanently deleted.')) return;
    const res = await fetch(`/api/recipe-books/${book.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/my/recipe-books');
  };

  const sortedEntries = [...book.entries].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Header */}
      {book.coverImageUrl && (
        <div className="w-full h-48 rounded-xl overflow-hidden mb-6">
          <Image src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">{book.title}</h1>
          {book.description && (
            <p className="mt-1 text-stone-500 text-sm">{book.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              book.isPublic ? 'bg-success-50 text-success-700' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {book.isPublic ? 'Public' : 'Private'}
          </span>
          {isOwner && (
            <Button variant="secondary" size="sm" shape="pill" onClick={() => setShowEditForm(v => !v)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {showEditForm && isOwner && (
        <form onSubmit={handleSaveEdit} className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4 mb-6">
          {error && <FormBanner type="error" message={error} />}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Cover photo</label>
            <ImageUpload
              value={editCoverImageUrl}
              onChange={setEditCoverImageUrl}
              onError={msg => setError(msg)}
              label="Add cover photo"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={editIsPublic}
              onClick={() => setEditIsPublic(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsPublic ? 'bg-primary-500' : 'bg-stone-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editIsPublic ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-stone-700">{editIsPublic ? 'Public' : 'Private'}</span>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" shape="pill" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" size="sm" shape="pill" onClick={() => setShowEditForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Recipes section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">Recipes</h2>
          {isMember && (
            <Button variant="secondary" size="sm" shape="pill" onClick={() => setShowAddModal(true)}>
              + Add recipe
            </Button>
          )}
        </div>

        {sortedEntries.length === 0
          ? (
              <p className="text-stone-400 text-sm py-8 text-center">No recipes in this book yet.</p>
            )
          : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedEntries.map((entry, i) => (
                  <div key={entry.id}>
                    <RecipeCard
                      id={entry.recipe.id}
                      title={entry.recipe.title}
                      description={entry.recipe.description}
                      coverImageUrl={entry.recipe.coverImageUrl}
                      forkCount={entry.recipe.forkCount}
                      isPublic={entry.recipe.isPublic}
                      isOwned={entry.recipe.authorId === currentUserId}
                      onRemoveFromBook={isMember ? () => handleRemoveEntry(entry.id) : undefined}
                    />
                    {/* Reorder controls */}
                    {isMember && (
                      <div className="flex gap-1 mt-1.5 justify-end">
                        <button
                          disabled={i === 0}
                          onClick={() => handleMove(entry.id, 'up')}
                          className="rounded px-2 py-0.5 text-xs text-stone-400 hover:text-stone-600 disabled:opacity-30 border border-stone-200 bg-white"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          disabled={i === sortedEntries.length - 1}
                          onClick={() => handleMove(entry.id, 'down')}
                          className="rounded px-2 py-0.5 text-xs text-stone-400 hover:text-stone-600 disabled:opacity-30 border border-stone-200 bg-white"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">Members</h2>
          {isOwner && (
            <Button variant="secondary" size="sm" shape="pill" onClick={() => setShowInviteModal(true)}>
              Invite collaborator
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {acceptedMembers.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                {m.user.avatarUrl
                  ? (
                      <Image src={m.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    )
                  : (
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-medium">
                        {(m.user.name ?? m.user.username ?? '?')[0].toUpperCase()}
                      </div>
                    )}
                <div>
                  <p className="text-sm font-medium text-stone-900">{m.user.name ?? m.user.username ?? 'Unknown'}</p>
                  {m.user.username && (
                    <p className="text-xs text-stone-400">
                      @
                      {m.user.username}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  m.role === OWNER ? 'bg-primary-50 text-primary-500' : 'bg-stone-100 text-stone-500'
                }`}
                >
                  {m.role}
                </span>
                {isOwner && m.role !== OWNER && m.userId !== currentUserId && (
                  <button
                    onClick={() => handleRemoveMember(m.userId)}
                    className="text-xs text-danger-400 hover:text-danger-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pending invites — owners only */}
        {isOwner && pendingMembers.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Pending invites</p>
            <div className="space-y-2">
              {pendingMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 px-4 py-2.5 text-sm">
                  <span className="text-stone-600">
                    @
                    {m.user.username ?? m.user.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">{m.role}</span>
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      className="text-xs text-danger-400 hover:text-danger-600"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leave / Remove buttons */}
      <div className="mt-10 pt-6 border-t border-stone-100 flex gap-3">
        {isOwner
          ? (
              <Button variant="danger" size="sm" onClick={handleRemoveFromCollection}>
                Remove from my collection
              </Button>
            )
          : (
              <Button variant="danger" size="sm" onClick={handleLeave}>
                Leave book
              </Button>
            )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Invite collaborator</h2>
            {inviteError && <FormBanner type="error" message={inviteError} />}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={e => setInviteUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {isPremium && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={inviteRole === OWNER}
                    onClick={() => setInviteRole(r => r === COLLABORATOR ? OWNER : COLLABORATOR)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inviteRole === OWNER ? 'bg-primary-500' : 'bg-stone-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${inviteRole === OWNER ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-stone-700">
                    Invite as
                    {' '}
                    {inviteRole === OWNER ? 'owner' : 'collaborator'}
                  </span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  shape="pill"
                  disabled={inviting || !inviteUsername.trim()}
                  onClick={handleInvite}
                >
                  {inviting ? 'Inviting…' : 'Send invite'}
                </Button>
                <Button variant="secondary" size="md" shape="pill" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add recipe modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Add a recipe</h2>
            <input
              type="text"
              value={recipeSearch}
              onChange={e => setRecipeSearch(e.target.value)}
              placeholder="Search your recipes…"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="max-h-72 overflow-y-auto space-y-1">
              {addableRecipes.length === 0
                ? (
                    <p className="text-center text-stone-400 text-sm py-6">No recipes to add.</p>
                  )
                : (
                    addableRecipes.map(r => (
                      <button
                        key={r.id}
                        disabled={adding === r.id}
                        onClick={() => handleAddRecipe(r.id)}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-stone-50 transition-colors disabled:opacity-50"
                      >
                        {r.coverImageUrl
                          ? (
                              <Image src={r.coverImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            )
                          : (
                              <div className="w-10 h-10 rounded-lg bg-stone-100 shrink-0" />
                            )}
                        <span className="text-sm font-medium text-stone-900 line-clamp-1">{r.title}</span>
                      </button>
                    ))
                  )}
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" shape="pill" onClick={() => setShowAddModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
