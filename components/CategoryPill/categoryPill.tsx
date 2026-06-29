'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
// Components
import { CHIP_ACTIVE_CLASS, CHIP_INACTIVE_CLASS } from '@/components/Chip';
import { SmallCheckIcon } from '@/components/Icons';

type CategoryPillProps = {
  href: string
  children: ReactNode
};

export const CategoryPill = ({ href, children }: CategoryPillProps) => (
  <Link href={href} className={CHIP_INACTIVE_CLASS}>
    {children}
  </Link>
);

type CategoryPillButtonProps = {
  children: ReactNode
  active?: boolean
  onClick?: () => void
};

export const CategoryPillButton = ({ children, active = false, onClick }: CategoryPillButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={active ? CHIP_ACTIVE_CLASS : CHIP_INACTIVE_CLASS}
  >
    {children}
    {active && (
      <SmallCheckIcon className="inline ml-1.5 w-2.5 h-2.5" />
    )}
  </button>
);
