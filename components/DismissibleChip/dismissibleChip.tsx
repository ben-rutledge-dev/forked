'use client';

// Components
import { CHIP_ACTIVE_CLASS, CHIP_INACTIVE_CLASS } from '@/components/Chip';
import { SmallCheckIcon, XIcon } from '@/components/Icons';

type DismissibleChipProps = {
  label: string
  selected: boolean
  onToggle: () => void
  onSkip: () => void
  onAlwaysSkip: () => void
  disabled?: boolean
};

export const DismissibleChip = ({
  label,
  selected,
  onToggle,
  onSkip,
  disabled = false,
}: DismissibleChipProps) => (
  <div className="group relative inline-flex items-center">
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`cursor-pointer disabled:cursor-not-allowed ${selected ? CHIP_ACTIVE_CLASS : CHIP_INACTIVE_CLASS}`}
    >
      {label}
      {selected && <SmallCheckIcon className="inline ml-1.5 w-2.5 h-2.5" />}
      {!selected && <span className="inline-block w-3.5" aria-hidden="true" />}
    </button>
    {!selected && (
      <button
        type="button"
        onClick={onSkip}
        disabled={disabled}
        className="absolute right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-stone-400 hover:text-stone-600 cursor-pointer disabled:cursor-not-allowed"
        aria-label={`Skip ${label}`}
      >
        <XIcon className="w-3 h-3" />
      </button>
    )}
  </div>
);
