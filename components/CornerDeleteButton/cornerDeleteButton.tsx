// Components
import { XIcon } from '@/components/Icons';

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
      <XIcon className="w-2.5 h-2.5" />
    </button>
  );
};
