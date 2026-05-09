import type { Metadata } from 'next';
// Components
import { ProfileForm } from './components/ProfileForm';
import { Button } from '@/components/Button';
import { PageHeading } from '@/components/Typography';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Edit Profile' };

const ProfilePage = async () => {
  const session = await auth();

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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <PageHeading>Edit profile</PageHeading>
        {user?.username && user.isPublic && (
          <Button href={`/u/${user.username}`} variant="primary" size="md" shape="pill">
            View profile
          </Button>
        )}
      </div>
      <ProfileForm user={user!} />
    </div>
  );
};

export default ProfilePage;
