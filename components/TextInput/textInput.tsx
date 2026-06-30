import React from 'react';

type Size = 'md' | 'sm' | 'xs';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** Controls padding and font size. Defaults to 'md'. */
  size?: Size
  /** Optional adornment rendered to the left, joined to the input border (e.g. "@" or "https://"). */
  prefix?: string
  /** When true (default), adds w-full to the input. Pass false for fixed-width fields. */
  fullWidth?: boolean
  /** Highlights the input with a red border to indicate a validation error. */
  error?: boolean
};

const baseClass = 'squircle bg-white dark:bg-stone-800 border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-1';
const normalBorder = 'border-stone-300 dark:border-stone-600 focus:border-stone-500 dark:focus:border-stone-400 focus:ring-stone-500 dark:focus:ring-stone-400';
const errorBorder = 'border-danger-400 dark:border-danger-500 focus:border-danger-500 dark:focus:border-danger-500 focus:ring-danger-400 dark:focus:ring-danger-500';

const sizeClasses: Record<Size, string> = {
  md: 'px-3 py-2 text-sm',
  sm: 'px-2 py-1.5 text-sm',
  xs: 'px-2 py-1 text-xs',
};

export const TextInput = React.forwardRef<HTMLInputElement, Props>(
  ({ size = 'md', prefix, fullWidth = true, error = false, className = '', ...props }, ref) => {
    const borderCls = error ? errorBorder : normalBorder;
    const inputCls = `${baseClass} ${borderCls} ${sizeClasses[size]}`;

    if (prefix) {
      return (
        <div className={`flex items-center squircle overflow-hidden border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 ${fullWidth ? 'w-full' : ''}`}>
          <span className={['shrink-0', sizeClasses[size], 'text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-900 border-r border-stone-300 dark:border-stone-600'].join(' ')}>
            {prefix}
          </span>
          <input
            ref={ref}
            className={['flex-1 min-w-0 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none', sizeClasses[size], className].filter(Boolean).join(' ')}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={[fullWidth ? 'w-full' : '', inputCls, className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  },
);

TextInput.displayName = 'TextInput';
