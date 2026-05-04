import Link from "next/link";

type Props = {
  id: string;
  title: string;
  coverImageUrl?: string | null;
  recipeCount: number;
  memberCount: number;
  isPublic: boolean;
  role?: "OWNER" | "COLLABORATOR";
  href?: string;
};

export function RecipeBookCard({
  id,
  title,
  coverImageUrl,
  recipeCount,
  memberCount,
  isPublic,
  role,
  href,
}: Props) {
  const target = href ?? `/my/recipe-books/${id}`;
  return (
    <div className="flex flex-col rounded-xl border border-stone-200 bg-white overflow-hidden hover:border-stone-300 transition-colors">
      {coverImageUrl ? (
        <Link href={target} className="block">
          <img src={coverImageUrl} alt="" className="w-full h-36 object-cover" />
        </Link>
      ) : (
        <Link href={target} className="block h-36 bg-stone-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-stone-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        </Link>
      )}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex-1">
          <Link href={target}>
            <h3 className="font-semibold text-stone-900 hover:text-stone-600 transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>
            {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"} · {memberCount}{" "}
            {memberCount === 1 ? "member" : "members"}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 ${
                isPublic
                  ? "bg-success-50 text-success-700"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {isPublic ? "public" : "private"}
            </span>
            {role && (
              <span className="rounded px-1.5 py-0.5 bg-primary-50 text-primary-500">
                {role.toLowerCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
