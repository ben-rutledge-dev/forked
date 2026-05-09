import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
// Components
import { ProfileRecipesGrid } from './components/ProfileRecipesGrid';
import { SectionHeading } from '@/components/Typography';
// Lib
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ username: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { name: true, username: true } });
  if (!user) return { title: 'Profile not found' };
  return { title: user.name ?? user.username ?? 'Profile' };
};

const PublicProfilePage = async ({ params }: Props) => {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username, isPublic: true },
    select: {
      id: true,
      name: true,
      showName: true,
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
        orderBy: { createdAt: 'desc' },
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

  const displayName = user.showName && user.name ? user.name : user.username;
  const hasLinks = user.websiteUrl || user.twitterHandle || user.instagramHandle || user.youtubeUrl;
  const displayUrl = (url: string) => {
    return url.replace(/^https?:\/\/(www\.)?/, '');
  };

  return (
    <div>
      {/* Cover — full viewport width */}
      {user.coverImageUrl
        ? (
            <div className="w-full relative h-80">
              <Image src={user.coverImageUrl} alt="" fill className="object-cover" sizes="100vw" />
            </div>
          )
        : (
            <div className="w-full h-24 bg-primary-50" />
          )}

      <div className="mx-auto max-w-4xl px-4">
        {/* Profile header */}
        <div className="flex items-end gap-4 -mt-8 mb-6 px-0">
          <div className="shrink-0 rounded-full border-4 border-white overflow-hidden bg-stone-100 w-20 h-20 relative">
            {user.avatarUrl
              ? (
                  <Image src={user.avatarUrl} alt={displayName ?? ''} fill className="object-cover" sizes="80px" />
                )
              : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-semibold text-stone-900 leading-tight">{displayName}</h1>
            {user.showName && user.name && user.username && (
              <p className="text-sm text-stone-400">
                @
                {user.username}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-stone-600 mb-4 leading-relaxed max-w-xl">{user.bio}</p>
        )}

        {/* Links */}
        {hasLinks && (
          <div className="flex flex-col gap-2 mb-6">
            {user.websiteUrl && (
              <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM4.332 8.027a6.012 6.012 0 0 1 1.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 0 1 9 7.5V8a2 2 0 0 0 4 0 2 2 0 0 1 1.523-1.943A5.977 5.977 0 0 1 16 10c0 .34-.028.675-.083 1H15a2 2 0 0 0-2 2v2.197A5.973 5.973 0 0 1 10 16v-2a2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-1.668-1.973Z" clipRule="evenodd" />
                </svg>
                {displayUrl(user.websiteUrl)}
              </a>
            )}
            {user.twitterHandle && (
              <a href={`https://x.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                x.com/
                {user.twitterHandle}
              </a>
            )}
            {user.instagramHandle && (
              <a href={`https://instagram.com/${user.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#E1306C] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
                instagram.com/
                {user.instagramHandle}
              </a>
            )}
            {user.youtubeUrl && (
              <a href={user.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#FF0000] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                {displayUrl(user.youtubeUrl)}
              </a>
            )}
          </div>
        )}

        <hr className="border-stone-100 mb-8" />

        {/* Recipes */}
        <SectionHeading className="mb-4">
          Recipes
          {' '}
          <span className="text-stone-400 font-normal">
            (
            {user.recipes.length}
            )
          </span>
        </SectionHeading>

        {user.recipes.length === 0
          ? (
              <p className="text-stone-400 text-sm">No public recipes yet.</p>
            )
          : (
              <ProfileRecipesGrid recipes={user.recipes.map(r => ({
                ...r,
                description: r.description ?? null,
                coverImageUrl: r.coverImageUrl ?? null,
                forkedFromId: r.forkedFromId ?? null,
              }))}
              />
            )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
