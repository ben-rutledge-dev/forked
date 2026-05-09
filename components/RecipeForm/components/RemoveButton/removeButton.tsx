type Props = {
  onClick: () => void
  label: string
};

export const RemoveButton = ({ onClick, label }: Props) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="flex-none flex items-center justify-center w-7 h-7 rounded-full border border-transparent text-stone-400 hover:bg-danger-50 hover:border-danger-300 hover:text-danger-500 transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="2" y1="2" x2="8" y2="8" />
      <line x1="8" y1="2" x2="2" y2="8" />
    </svg>
  </button>
);
