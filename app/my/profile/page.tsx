import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { ProfileForm } from "./ProfileForm";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Edit Profile" };

export default async function ProfilePage() {
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
        <h1 className="text-2xl font-semibold text-stone-900">Edit profile</h1>
        {user?.username && user.isPublic && (
          <Button href={`/u/${user.username}`} variant="primary" size="md" shape="pill">
            View profile
          </Button>
        )}
      </div>
      <ProfileForm user={user!} />
    </div>
  );
}
