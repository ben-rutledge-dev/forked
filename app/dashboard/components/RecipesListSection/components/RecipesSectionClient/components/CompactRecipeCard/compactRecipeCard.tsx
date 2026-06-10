import Image from 'next/image';
import Link from 'next/link';
// Components
import { RecipeIcon } from '@/components/Icons';

type Props = {
  id: string
  title: string
  coverImageUrl: string | null
};

export const CompactRecipeCard = ({ id, title, coverImageUrl }: Props) => (
  <Link
    href={`/recipes/${id}`}
    className="group block w-48 shrink-0 rounded-xl border border-stone-200 bg-white overflow-hidden hover:border-stone-300 transition-colors scroll-snap-align-start"
  >
    <div className="relative h-32 bg-stone-100 flex items-center justify-center">
      {coverImageUrl
        ? <Image src={coverImageUrl} alt="" fill className="object-cover" sizes="160px" />
        : <RecipeIcon className="w-10 h-10 text-stone-300" />}
    </div>
    <div className="px-3 py-2">
      <h3 className="font-semibold text-stone-900 truncate">{title}</h3>
    </div>
  </Link>
);
