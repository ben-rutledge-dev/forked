"use client";

import { Button } from "@/components/Button";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        size="md"
        shape="rounded"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← Previous
      </Button>
      <span className="text-sm text-stone-500">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="md"
        shape="rounded"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next →
      </Button>
    </div>
  );
}
