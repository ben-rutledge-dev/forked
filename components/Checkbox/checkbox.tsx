import React from 'react';

type Props = {
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Main label text. */
  label?: React.ReactNode
  /** Optional helper text rendered below the label, indented to align with the label text. */
  description?: React.ReactNode
  id?: string
  className?: string
  disabled?: boolean
};

export const Checkbox = ({ checked, onChange, label, description, id, className, disabled }: Props) => (
  <div className={className}>
    <label htmlFor={id} className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 shrink-0 rounded border-stone-300 accent-stone-900"
      />
      {label !== undefined && <span className="text-sm text-stone-700">{label}</span>}
    </label>
    {description && (
      <p className="mt-0.5 pl-6 text-xs text-stone-400">{description}</p>
    )}
  </div>
);
