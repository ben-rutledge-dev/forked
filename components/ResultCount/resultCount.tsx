type Props = {
  count: number
  noun?: string
  isFetching?: boolean
  hasFilters?: boolean
  onClear?: () => void
};

export const ResultCount = ({
  count,
  noun = 'recipe',
  isFetching = false,
  hasFilters = false,
  onClear,
}: Props) => (
  <div className="flex items-center justify-between mt-2 min-h-[20px]">
    <p className="text-sm text-stone-400">
      {isFetching
        ? 'Loading…'
        : `${count} ${count === 1 ? noun : `${noun}s`}`}
    </p>
    {hasFilters && onClear && (
      <button
        type="button"
        onClick={onClear}
        className="text-sm text-stone-400 hover:text-stone-600 underline"
      >
        Clear all
      </button>
    )}
  </div>
);
