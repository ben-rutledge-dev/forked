import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
// Components
import { ProfileForm } from './components/ProfileForm';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Edit Profile' };

const ProfilePage = async () => {
  const session = await auth();
  const t = await getTranslations('myProfile');

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
    <PageLayout width="narrow">
      <PageHeader
        title={t('heading')}
        action={
          user?.username && user.isPublic
            ? (
                <Button href={`/u/${user.username}`} variant="primary" size="md">
                  {t('viewProfile')}
                </Button>
              )
            : undefined
        }
      />
      <ProfileForm user={user!} />
    </PageLayout>
  );
};

export default ProfilePage;
