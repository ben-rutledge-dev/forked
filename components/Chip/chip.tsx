'use client';

import { type ReactNode } from 'react';

const BASE_COLORS = 'inline-flex items-center rounded-full border font-medium transition-colors';
const SIZE = {
  md: 'px-3 py-1 text-sm',
  sm: 'px-2 py-0.5 text-xs',
};

export const CHIP_ACTIVE_CLASS = `${BASE_COLORS} ${SIZE.md} bg-primary-500 border-primary-500 text-white`;
export const CHIP_INACTIVE_CLASS = `${BASE_COLORS} ${SIZE.md} bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500`;

type ChipProps = {
  active?: boolean
  size?: 'md' | 'sm'
  children: ReactNode
  className?: string
};

export const Chip = ({ active = false, size = 'md', children, className = '' }: ChipProps) => {
  const colors = active
    ? 'bg-primary-500 border-primary-500 text-white'
    : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500';
  return (
    <span className={`${BASE_COLORS} ${SIZE[size]} ${colors} ${className}`}>
      {children}
    </span>
  );
};
