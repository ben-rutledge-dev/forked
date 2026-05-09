export type PatchProfilePayload = {
  username?: string | null
  bio?: string | null
  avatarUrl?: string | null
  coverImageUrl?: string | null
  websiteUrl?: string | null
  twitterHandle?: string | null
  instagramHandle?: string | null
  youtubeUrl?: string | null
  isPublic?: boolean
  showName?: boolean
};

export type Profile = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isPublic: boolean
  showName: boolean
  username: string | null
  bio: string | null
  avatarUrl: string | null
  coverImageUrl: string | null
  websiteUrl: string | null
  twitterHandle: string | null
  instagramHandle: string | null
  youtubeUrl: string | null
};

export type PatchProfileResponse = Profile;
