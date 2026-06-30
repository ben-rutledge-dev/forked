import React from 'react';

type Size = 'md' | 'sm';

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  /** Controls padding and font size. Defaults to 'md'. */
  size?: Size
};

const baseClass = 'w-full rounded-lg squircle bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 resize-none';

const sizeClasses: Record<Size, string> = {
  md: 'px-3 py-2 text-sm',
  sm: 'px-2 py-1.5 text-sm',
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ size = 'md', className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={[baseClass, sizeClasses[size], className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
