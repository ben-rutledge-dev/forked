type Props = {
  onClick: () => void
  label?: string
  positionClassName?: string
};

export const CornerDeleteButton = ({ onClick, label = 'Remove', positionClassName = '-top-2.5 -right-2.5' }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute ${positionClassName} flex items-center justify-center w-5 h-5 rounded-full bg-stone-200 text-stone-500 hover:bg-danger-100 hover:text-danger-500 transition-colors z-10 cursor-pointer`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 10 10"
        className="w-2.5 h-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        <line x1="2" y1="2" x2="8" y2="8" />
        <line x1="8" y1="2" x2="2" y2="8" />
      </svg>
    </button>
  );
};
