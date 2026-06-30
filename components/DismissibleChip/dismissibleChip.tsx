'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
// Components
import { CHIP_ACTIVE_CLASS, CHIP_INACTIVE_CLASS } from '@/components/Chip';
import { SmallCheckIcon, XIcon } from '@/components/Icons';

type DismissibleChipProps = {
  label: string
  recipes?: string[]
  selected: boolean
  onToggle: () => void
  onSkip: () => void
  onAlwaysSkip: () => void
  disabled?: boolean
};

const LONGPRESS_MS = 500;

export const DismissibleChip = ({
  label,
  recipes,
  selected,
  onToggle,
  onSkip,
  disabled = false,
}: DismissibleChipProps) => {
  const t = useTranslations('common');
  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRecipes = recipes && recipes.length > 0;

  const openTooltip = () => setShowTooltip(true);
  const closeTooltip = () => setShowTooltip(false);

  const handleTouchStart = () => {
    if (!hasRecipes) return;
    longPressTimer.current = setTimeout(() => setShowTooltip(true), LONGPRESS_MS);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = () => {
    clearLongPress();
    // keep tooltip visible until next tap elsewhere
  };

  return (
    <div
      className="group relative inline-flex items-center"
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={clearLongPress}
      onTouchMove={clearLongPress}
    >
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
          className="absolute right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-stone-400 dark:text-stone-500 hover:text-stone-600 cursor-pointer disabled:cursor-not-allowed"
          aria-label={`Skip ${label}`}
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}

      {showTooltip && hasRecipes && (
        <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 squircle px-3 py-2.5 shadow-sm z-10 min-w-40 pointer-events-none">
          <p className="text-stone-400 dark:text-stone-500 uppercase tracking-wide text-[10px] mb-1.5">{t('usedIn')}</p>
          {recipes.map(r => (
            <div key={r} className="flex items-center gap-1.5 py-0.5 text-xs text-stone-700 dark:text-stone-300 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
