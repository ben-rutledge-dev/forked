'use client';

import { type ReactNode } from 'react';

const BASE = 'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors';
export const CHIP_ACTIVE_CLASS = `${BASE} bg-primary-500 border-primary-500 text-white`;
export const CHIP_INACTIVE_CLASS = `${BASE} bg-white border-stone-300 text-stone-600 hover:border-stone-400`;

type ChipProps = {
  active?: boolean
  children: ReactNode
  className?: string
};

export const Chip = ({ active = false, children, className = '' }: ChipProps) => (
  <span className={`${active ? CHIP_ACTIVE_CLASS : CHIP_INACTIVE_CLASS} ${className}`}>
    {children}
  </span>
);
