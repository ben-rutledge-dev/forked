import { z } from 'zod';

// Shape/type validation only — deliberately does NOT enforce a strict URL format on
// websiteUrl/youtubeUrl, since the route auto-prepends "https://" to bare domains before
// validating them; a strict refine here would reject values the route is meant to accept.
export const patchProfileSchema = z.object({
  username: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  twitterHandle: z.string().nullable().optional(),
  instagramHandle: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  showName: z.boolean().optional(),
});
export type PatchProfilePayload = z.infer<typeof patchProfileSchema>;

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
