type Props = {
  checked: boolean
  onChange: (value: boolean) => void
  label?: React.ReactNode
  id?: string
  className?: string
};

export const Toggle = ({ checked, onChange, label, id, className }: Props) => (
  <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-500' : 'bg-stone-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
    {label && <span className="text-sm text-stone-700">{label}</span>}
  </div>
);
