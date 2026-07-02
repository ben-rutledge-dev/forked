import React from 'react';

type IconButtonVariant = 'default' | 'danger';

type IconButtonProps = {
  variant?: IconButtonVariant
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  children: React.ReactNode
};

const variantClasses: Record<IconButtonVariant, string> = {
  default: 'text-stone-300 hover:text-stone-500 disabled:opacity-20 leading-none',
  danger: 'text-stone-300 hover:text-danger-400 leading-none',
};

export const IconButton: React.FC<IconButtonProps> = (props) => {
  const { variant = 'default', disabled, type = 'button', onClick, className, children } = props;
  const classes = [
    'transition-colors',
    variantClasses[variant],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
};
