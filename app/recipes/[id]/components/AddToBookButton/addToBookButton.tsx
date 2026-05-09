'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
// Components
import { Button } from '@/components/Button';

type BookOption = { id: string, title: string };

export const AddToBookButton = ({ recipeId }: { recipeId: string }) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [books, setBooks] = useState<BookOption[] | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleOpen = async () => {
    if (!session) {
      signIn();
      return;
    }
    setOpen(v => !v);
    if (!books) {
      const res = await fetch('/api/recipe-books');
      if (res.ok) {
        const data = await res.json();
        setBooks((data.books as BookOption[]) ?? []);
      }
      else {
        setBooks([]);
      }
    }
  };

  const handleAdd = async (bookId: string) => {
    setAdding(bookId);
    try {
      await fetch(`/api/recipe-books/${bookId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      setDone(bookId);
      setTimeout(() => {
        setOpen(false);
        setDone(null);
      }, 1200);
    }
    finally {
      setAdding(null);
    }
  };

  let dropdownContent: ReactNode;
  if (books === null) {
    dropdownContent = <div className="px-4 py-3 text-sm text-stone-400">Loading…</div>;
  }
  else if (books.length === 0) {
    dropdownContent = (
      <div className="px-4 py-3 text-sm text-stone-400">
        No recipe books yet.
        {' '}
        <Link href="/my/recipe-books/new" className="underline text-stone-600 hover:text-stone-900">Create one</Link>
      </div>
    );
  }
  else {
    dropdownContent = (
      <div className="max-h-56 overflow-y-auto">
        {books.map(b => (
          <button
            key={b.id}
            disabled={adding === b.id || done === b.id}
            onClick={() => handleAdd(b.id)}
            className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-60 flex items-center justify-between gap-2"
          >
            <span className="truncate">{b.title}</span>
            {done === b.id && (
              <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" size="md" shape="pill" onClick={handleOpen}>
        + Add to Recipe Book
      </Button>

      {open && (
        <div className="absolute left-0 top-11 z-30 w-56 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden max-w-[calc(100vw-2rem)] sm:left-auto sm:right-0">
          {dropdownContent}
        </div>
      )}
    </div>
  );
};
