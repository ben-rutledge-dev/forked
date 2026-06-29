import React from 'react';

type Size = 'md' | 'sm' | 'xs';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** Controls padding and font size. Defaults to 'md'. */
  size?: Size
  /** Optional adornment rendered to the left, joined to the input border (e.g. "@" or "https://"). */
  prefix?: string
  /** When true (default), adds w-full to the input. Pass false for fixed-width fields. */
  fullWidth?: boolean
};

const baseClass = 'squircle bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500';

const sizeClasses: Record<Size, string> = {
  md: 'px-3 py-2 text-sm',
  sm: 'px-2 py-1.5 text-sm',
  xs: 'px-2 py-1 text-xs',
};

export const TextInput = React.forwardRef<HTMLInputElement, Props>(
  ({ size = 'md', prefix, fullWidth = true, className = '', ...props }, ref) => {
    const inputCls = `${baseClass} ${sizeClasses[size]}`;

    if (prefix) {
      return (
        <div className={`flex items-center squircle overflow-hidden border border-stone-300 bg-white ${fullWidth ? 'w-full' : ''}`}>
          <span className={['shrink-0', sizeClasses[size], 'text-stone-400 bg-stone-50 border-r border-stone-300'].join(' ')}>
            {prefix}
          </span>
          <input
            ref={ref}
            className={['flex-1 min-w-0 bg-white text-stone-900 placeholder-stone-400 focus:outline-none', sizeClasses[size], className].filter(Boolean).join(' ')}
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
