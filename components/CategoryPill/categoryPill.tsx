'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

const BASE = 'rounded-full border px-3 py-1 text-sm font-medium transition-colors';
export const ACTIVE_CLASS = `${BASE} bg-primary-500 border-primary-500 text-white`;
export const INACTIVE_CLASS = `${BASE} bg-white border-stone-300 text-stone-600 hover:border-stone-400`;

type CategoryPillProps = {
  href: string
  children: ReactNode
};

export const CategoryPill = ({ href, children }: CategoryPillProps) => (
  <Link href={href} className={INACTIVE_CLASS}>
    {children}
  </Link>
);

type CategoryPillButtonProps = {
  children: ReactNode
  active?: boolean
  showTick?: boolean
  onClick?: () => void
};

export const CategoryPillButton = ({ children, active = false, showTick = false, onClick }: CategoryPillButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={active ? ACTIVE_CLASS : INACTIVE_CLASS}
  >
    {children}
    {active && showTick && (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="inline ml-1.5">
        <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </button>
);
