// Components
import { XIcon } from '@/components/Icons';

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
    <XIcon className="w-2.5 h-2.5" />
  </button>
);
