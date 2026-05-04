"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ForkIcon } from "@/components/ForkIcon";
import { Button } from "@/components/Button";

type BookOption = { id: string; title: string };

type Props = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl?: string | null;
  forkCount: number;
  isPublic?: boolean;
  isOwned?: boolean;
  forkedFromId?: string | null;
  onVisibilityToggle?: (id: string, isPublic: boolean) => void;
  onRemoveFromBook?: () => void;
  onDelete?: (id: string) => void;
};

export function RecipeCard({
  id,
  title,
  description,
  coverImageUrl,
  forkCount,
  isPublic,
  isOwned,
  forkedFromId,
  onVisibilityToggle,
  onRemoveFromBook,
  onDelete,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [forking, setForking] = useState(false);
  const [iconAnimating, setIconAnimating] = useState(false);
  const pendingForkId = useRef<string | null>(null);

  // Hover action menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [addToBookOpen, setAddToBookOpen] = useState(false);
  const [books, setBooks] = useState<BookOption[] | null>(null);
  const [addingToBook, setAddingToBook] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen && !addToBookOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setAddToBookOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, addToBookOpen]);

  const handleFork = async () => {
    if (!session) { signIn(); return; }
    setForking(true);
    setIconAnimating(true);
    try {
      const res = await fetch(`/api/recipes/${id}/fork`, { method: "POST" });
      if (res.ok) {
        const fork = await res.json();
        pendingForkId.current = fork.id;
      }
    } finally {
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
    setMenuOpen(false);
    setAddToBookOpen(true);
    if (!books) {
      const res = await fetch("/api/recipe-books");
      if (res.ok) {
        const data = await res.json();
        setBooks((data.books as BookOption[]) ?? []);
      } else {
        setBooks([]);
      }
    }
  };

  const handleAddToBook = async (bookId: string) => {
    setAddingToBook(bookId);
    try {
      await fetch(`/api/recipe-books/${bookId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: id }),
      });
    } finally {
      setAddingToBook(null);
      setAddToBookOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) onDelete?.(id);
    } finally {
      setDeleting(false);
    }
  };

  const href = isOwned ? `/my/recipes/${id}` : `/recipes/${id}`;

  // Shared icon button style — always grey
  const iconBtnCls =
    "flex items-center justify-center w-7 h-7 rounded-lg bg-white/90 text-stone-500 hover:bg-white hover:text-stone-700 shadow-sm transition-colors";

  return (
    <div className="group relative flex flex-col rounded-xl border border-stone-200 bg-white overflow-hidden hover:border-stone-300 transition-colors">
      {/* Cover image / placeholder */}
      <Link href={href} className="block">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt="" className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 bg-stone-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        )}
      </Link>

      {/* Hover action buttons — top right */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
        {/* Remove from book */}
        {onRemoveFromBook && (
          <button
            title="Remove from Recipe Book"
            onClick={onRemoveFromBook}
            className={iconBtnCls}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Edit (owned only) */}
        {isOwned && (
          <Link href={`/my/recipes/${id}/edit`} className={iconBtnCls} title="Edit recipe">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
            </svg>
          </Link>
        )}

        {/* 3-dot menu (logged-in users only) */}
        {session && (
          <div className="relative">
            <button
              title="More actions"
              onClick={() => { setMenuOpen((v) => !v); setAddToBookOpen(false); }}
              className={iconBtnCls}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>

            {menuOpen && !addToBookOpen && (
              <div className="absolute right-0 top-8 z-30 w-48 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                <button
                  onClick={handleOpenAddToBook}
                  className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Add to Recipe Book
                </button>
                {isOwned && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Move to trash"}
                  </button>
                )}
              </div>
            )}

            {addToBookOpen && (
              <div className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
                  <button
                    onClick={() => { setAddToBookOpen(false); setMenuOpen(true); }}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs font-medium text-stone-500">Add to Recipe Book</span>
                </div>
                {books === null ? (
                  <div className="px-4 py-3 text-sm text-stone-400">Loading…</div>
                ) : books.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-stone-400">No recipe books yet.</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    {books.map((b) => (
                      <button
                        key={b.id}
                        disabled={addingToBook === b.id}
                        onClick={() => handleAddToBook(b.id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 truncate"
                      >
                        {b.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex-1">
          <Link href={href}>
            <h3 className="font-semibold text-stone-900 hover:text-stone-600 transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>
          {description && (
            <p className="mt-1 text-sm text-stone-500 line-clamp-2">{description}</p>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>{forkCount} {forkCount === 1 ? "fork" : "forks"}</span>
          {!isOwned && (
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              disabled={forking}
              onClick={handleFork}
              className="flex items-center gap-1.5"
            >
              {forking ? "Forking…" : "Fork"}
              <ForkIcon animating={iconAnimating} onDone={handleAnimationDone} size={12} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}