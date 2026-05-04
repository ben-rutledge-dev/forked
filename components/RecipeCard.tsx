import Link from "next/link";
import { useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { ForkIcon } from "@/components/ForkIcon";

type Props = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl?: string | null;
  forkCount: number;
  isPublic?: boolean;
  isOwned?: boolean;
  forkedFromId?: string | null;
  onVisibilityToggle?: (id: string, isPublic: boolean) => void;
};

export default function RecipeCard({
  id,
  title,
  description,
  coverImageUrl,
  forkCount,
  isPublic,
  isOwned,
  forkedFromId,
  onVisibilityToggle,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [forking, setForking] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [iconAnimating, setIconAnimating] = useState(false);
  const pendingForkId = useRef<string | null>(null);

  const handleFork = async () => {
    if (!session) {
      signIn();
      return;
    }
    setForking(true);
    setIconAnimating(true);
    try {
      const res = await fetch(`/api/recipes/${id}/fork`, { method: "POST" });
      if (res.ok) {
        const fork = await res.json();
        pendingForkId.current = fork.id;
      }
    } finally {
      setForking(false);
    }
  };

  const handleAnimationDone = () => {
    setIconAnimating(false);
    if (pendingForkId.current) {
      router.push(`/my/recipes/${pendingForkId.current}/edit`);
      pendingForkId.current = null;
    }
  };

  const handleVisibilityToggle = async () => {
    if (!onVisibilityToggle) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/recipes/${id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (res.ok) {
        onVisibilityToggle(id, !isPublic);
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-stone-200 bg-white overflow-hidden gap-0 hover:border-stone-300 transition-colors">
      {coverImageUrl && (
        <Link href={isOwned ? `/my/recipes/${id}` : `/recipe/${id}`} className="block">
          <img
            src={coverImageUrl}
            alt=""
            className="w-full h-36 object-cover"
          />
        </Link>
      )}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex-1">
          <Link href={isOwned ? `/my/recipes/${id}` : `/recipe/${id}`}>
            <h3 className="font-semibold text-stone-900 hover:text-stone-600 transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>
          {description && (
            <p className="mt-1 text-sm text-stone-500 line-clamp-2">{description}</p>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>
            {forkCount} {forkCount === 1 ? "fork" : "forks"}
          </span>
          <div className="flex items-center gap-2">
            {isOwned && (
              <>
                <button
                  onClick={handleVisibilityToggle}
                  disabled={toggling}
                  className={`rounded px-1.5 py-0.5 transition-colors ${
                    isPublic
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }`}
                >
                  {isPublic ? "public" : "private"}
                </button>
                <Link
                  href={`/my/recipes/${id}/edit`}
                  className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  Edit
                </Link>
              </>
            )}
            {!isOwned && (
              <button
                onClick={handleFork}
                disabled={forking}
                className="flex items-center gap-1.5 rounded-full bg-primary-500 px-3 py-1 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {forking ? "Forking…" : "Fork"}
                <ForkIcon animating={iconAnimating} onDone={handleAnimationDone} size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}