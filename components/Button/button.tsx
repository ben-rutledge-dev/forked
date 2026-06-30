import Link from 'next/link';
import React from 'react';

type ButtonVariant
  = | 'primary'
    | 'neutral'
    | 'secondary'
    | 'ghost'
    | 'danger'
    | 'nav-pill'
    | 'nav-link';

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  href?: string
  className?: string
  children: React.ReactNode
};

const variantClasses: Record<ButtonVariant, string> = {
  'primary': 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50',
  'neutral': 'bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50',
  'secondary': 'border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40 bg-white dark:bg-stone-800',
  'ghost': 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200',
  'danger': 'text-danger-400 hover:text-danger-600 disabled:opacity-50',
  'nav-pill': 'bg-black/20 text-white hover:bg-black/30 disabled:opacity-50',
  'nav-link': 'text-primary-200 hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm font-medium',
  xl: 'px-6 py-4 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  disabled,
  type = 'button',
  onClick,
  href,
  className,
  children,
}) => {
  const classes = [
    'inline-flex items-center justify-center gap-1.5',
    'cursor-pointer disabled:cursor-not-allowed',
    'transition-colors',
    'rounded-lg squircle',
    variantClasses[variant],
    sizeClasses[size],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
};
