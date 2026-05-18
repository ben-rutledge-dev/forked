import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
// Components
import { ProfileRecipesGrid } from './components/ProfileRecipesGrid';
import { GlobeIcon, InstagramIcon, TwitterXIcon, UserIcon, YouTubeIcon } from '@/components/Icons';
import { PageLayout } from '@/components/PageLayout';
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
  const t = await getTranslations('myProfile');

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

      <PageLayout py="none">
        {/* Profile header */}
        <div className="flex items-end gap-4 -mt-8 mb-6 px-0">
          <div className="shrink-0 rounded-full border-4 border-white overflow-hidden bg-stone-100 w-20 h-20 relative">
            {user.avatarUrl
              ? (
                  <Image src={user.avatarUrl} alt={displayName ?? ''} fill className="object-cover" sizes="80px" />
                )
              : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <UserIcon className="w-10 h-10" />
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
                <GlobeIcon className="w-4 h-4 shrink-0" />
                {displayUrl(user.websiteUrl)}
              </a>
            )}
            {user.twitterHandle && (
              <a href={`https://x.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                <TwitterXIcon className="w-4 h-4 shrink-0" />
                x.com/
                {user.twitterHandle}
              </a>
            )}
            {user.instagramHandle && (
              <a href={`https://instagram.com/${user.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#E1306C] transition-colors">
                <InstagramIcon className="w-4 h-4 shrink-0" />
                instagram.com/
                {user.instagramHandle}
              </a>
            )}
            {user.youtubeUrl && (
              <a href={user.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#FF0000] transition-colors">
                <YouTubeIcon className="w-4 h-4 shrink-0" />
                {displayUrl(user.youtubeUrl)}
              </a>
            )}
          </div>
        )}

        <hr className="border-stone-100 mb-8" />

        {/* Recipes */}
        <SectionHeading className="mb-4">
          {t('recipesHeading')}
          {' '}
          <span className="text-stone-400 font-normal">
            (
            {user.recipes.length}
            )
          </span>
        </SectionHeading>

        {user.recipes.length === 0
          ? (
              <p className="text-stone-400 text-sm">{t('noPublicRecipes')}</p>
            )
          : (
              <ProfileRecipesGrid recipes={user.recipes.map(r => ({
                ...r,
                description: r.description ?? null,
                coverImageUrl: r.coverImageUrl ?? null,
                forkedFromId: r.forkedFromId ?? null,
                tags: [],
              }))}
              />
            )}
      </PageLayout>
    </div>
  );
};

export default PublicProfilePage;
