import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import RecipeCard from "@/components/RecipeCard";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { name: true, username: true } });
  if (!user) return { title: "Profile not found" };
  return { title: user.name ?? user.username ?? "Profile" };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username, isPublic: true },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      coverImageUrl: true,
      websiteUrl: true,
      twitterHandle: true,
      instagramHandle: true,
      youtubeUrl: true,
      recipes: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          coverImageUrl: true,
          isPublic: true,
          forkCount: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          forkedFromId: true,
          author: { select: { id: true, name: true, username: true, isPublic: true } },
        },
      },
    },
  });

  if (!user) notFound();

  const displayName = user.name ?? user.username;
  const hasLinks = user.websiteUrl || user.twitterHandle || user.instagramHandle || user.youtubeUrl;

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* Cover */}
      {user.coverImageUrl ? (
        <div className="-mx-4 mb-0">
          <img src={user.coverImageUrl} alt="" className="w-full h-48 object-cover" />
        </div>
      ) : (
        <div className="-mx-4 h-24 bg-primary-50" />
      )}

      {/* Profile header */}
      <div className="flex items-end gap-4 -mt-8 mb-6 px-0">
        <div className="shrink-0 rounded-full border-4 border-white overflow-hidden bg-stone-100 w-20 h-20">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName ?? ""} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="pb-1">
          <h1 className="text-xl font-semibold text-stone-900 leading-tight">{displayName}</h1>
          {user.username && <p className="text-sm text-stone-400">@{user.username}</p>}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-stone-600 mb-4 leading-relaxed max-w-xl">{user.bio}</p>
      )}

      {/* Links */}
      {hasLinks && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6 text-sm text-stone-500">
          {user.websiteUrl && (
            <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-stone-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0ZM1 8a7 7 0 0 1 .78-3.23C3.18 5.7 4.9 7.8 5 8c-.06.42-.06.85 0 1.27-1.09.13-2.17.13-3.26 0A7 7 0 0 1 1 8ZM8 15a7 7 0 0 1-4.63-1.74c.88-.1 1.77-.1 2.65 0 .34.03.69.05 1 .05.31 0 .62-.02.93-.05.88-.1 1.77-.1 2.65 0A7 7 0 0 1 8 15Z"/></svg>
              {new URL(user.websiteUrl).hostname}
            </a>
          )}
          {user.twitterHandle && (
            <a href={`https://x.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 transition-colors">
              @{user.twitterHandle}
            </a>
          )}
          {user.instagramHandle && (
            <a href={`https://instagram.com/${user.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 transition-colors">
              @{user.instagramHandle}
            </a>
          )}
          {user.youtubeUrl && (
            <a href={user.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-700 transition-colors">
              YouTube
            </a>
          )}
        </div>
      )}

      <hr className="border-stone-100 mb-8" />

      {/* Recipes */}
      <h2 className="font-medium text-stone-900 mb-4">
        Recipes <span className="text-stone-400 font-normal">({user.recipes.length})</span>
      </h2>

      {user.recipes.length === 0 ? (
        <p className="text-stone-400 text-sm">No public recipes yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user.recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description ?? null}
              coverImageUrl={recipe.coverImageUrl}
              isPublic={recipe.isPublic}
              forkCount={0}
              forkedFromId={recipe.forkedFromId ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
