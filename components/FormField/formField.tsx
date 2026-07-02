import React from 'react';

type FormFieldProps = {
  label: React.ReactNode
  htmlFor?: string
  hint?: React.ReactNode
  error?: string
  className?: string
  children: React.ReactNode
};

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { label, htmlFor, hint, error, className, children } = props;
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
};
