import Image from 'next/image';
import Link from 'next/link';
// Components
import { RecipeIcon } from '@/components/Icons';

type Props = {
  id: string
  title: string
  coverImageUrl: string | null
  tags?: string[]
  categories?: string[]
};

export const CompactRecipeCard = ({ id, title, coverImageUrl, tags, categories }: Props) => {
  const chips = [...(categories ?? []).map(c => ({ label: c, kind: 'category' as const })), ...(tags ?? []).map(t => ({ label: t, kind: 'tag' as const }))];
  return (
    <Link
      href={`/recipes/${id}`}
      className="group relative block w-full rounded-xl squircle shadow-sm bg-white hover:shadow-md overflow-hidden transition-shadow"
    >
      <div className="relative h-32 bg-stone-100 flex items-center justify-center">
        {coverImageUrl
          ? <Image src={coverImageUrl} alt="" fill className="object-cover" sizes="160px" />
          : <RecipeIcon className="w-10 h-10 text-stone-300" />}
      </div>
      <div className="px-3 py-2">
        <h3 className="font-semibold text-stone-900 truncate">{title}</h3>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {chips.slice(0, 3).map(chip => (
              <span
                key={chip.label}
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-600"
              >
                {chip.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};
