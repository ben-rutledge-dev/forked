import React from 'react';

type Props = {
  label: React.ReactNode
  htmlFor?: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
};

export const FormField = ({ label, htmlFor, hint, className, children }: Props) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700 mb-1">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
  </div>
);
