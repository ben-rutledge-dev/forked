import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
// Components
import { Button } from '@/components/Button';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// App
import { ProfileForm } from '@/app/my/profile/components/ProfileForm';

export const metadata: Metadata = { title: 'Settings — Profile' };

const SettingsProfilePage = async () => {
  const session = await auth();
  const t = await getTranslations('settings');

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPublic: true,
      showName: true,
      username: true,
      bio: true,
      avatarUrl: true,
      coverImageUrl: true,
      websiteUrl: true,
      twitterHandle: true,
      instagramHandle: true,
      youtubeUrl: true,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t('profileHeading')}
        </h2>
        {user?.username && user.isPublic && (
          <Button href={`/u/${user.username}`} variant="primary" size="md">
            {t('viewProfile')}
          </Button>
        )}
      </div>
      <ProfileForm user={user!} />
    </div>
  );
};

export default SettingsProfilePage;
