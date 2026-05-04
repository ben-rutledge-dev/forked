"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/Button";

type BookOption = { id: string; title: string };

export function AddToBookButton({ recipeId }: { recipeId: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [books, setBooks] = useState<BookOption[] | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleOpen() {
    if (!session) { signIn(); return; }
    setOpen((v) => !v);
    if (!books) {
      const res = await fetch("/api/recipe-books");
      if (res.ok) {
        const data = await res.json();
        setBooks((data.books as BookOption[]) ?? []);
      } else {
        setBooks([]);
      }
    }
  }

  async function handleAdd(bookId: string) {
    setAdding(bookId);
    try {
      await fetch(`/api/recipe-books/${bookId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      setDone(bookId);
      setTimeout(() => { setOpen(false); setDone(null); }, 1200);
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" size="md" shape="pill" onClick={handleOpen}>
        + Add to Recipe Book
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-56 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
          {books === null ? (
            <div className="px-4 py-3 text-sm text-stone-400">Loading…</div>
          ) : books.length === 0 ? (
            <div className="px-4 py-3 text-sm text-stone-400">
              No recipe books yet.{" "}
              <a href="/my/recipe-books/new" className="underline text-stone-600 hover:text-stone-900">Create one</a>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              {books.map((b) => (
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
          )}
        </div>
      )}
    </div>
  );
}
