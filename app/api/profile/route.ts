import { NextRequest } from 'next/server';
// Data
import { patchProfileSchema } from '@/data/profile/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';

const ALLOWED_STRING_FIELDS = [
  'username',
  'bio',
  'avatarUrl',
  'coverImageUrl',
  'websiteUrl',
  'twitterHandle',
  'instagramHandle',
  'youtubeUrl',
] as const;

type StringField = (typeof ALLOWED_STRING_FIELDS)[number];

export const PATCH = async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = await parseBody(req, patchProfileSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;
  const stringData: Partial<Record<StringField, string | null>> = {};
  let isPublic: boolean | undefined;

  for (const field of ALLOWED_STRING_FIELDS) {
    if (field in body) {
      stringData[field] = body[field] === null ? null : String(body[field]);
    }
  }
  let showName: boolean | undefined;
  if ('isPublic' in body) {
    isPublic = Boolean(body.isPublic);
  }
  if ('showName' in body) {
    showName = Boolean(body.showName);
  }

  // Validate username: alphanumeric + underscores only, 3–30 chars
  if (typeof stringData.username === 'string') {
    const clean = stringData.username.trim();
    if (clean.length > 0 && !/^[a-zA-Z0-9_]{3,30}$/.test(clean)) {
      return Response.json(
        { error: 'Username must be 3–30 characters and contain only letters, numbers, or underscores.' },
        { status: 422 },
      );
    }
    stringData.username = clean || null;
  }

  // Normalize and validate URL fields
  const urlFields: StringField[] = ['websiteUrl', 'youtubeUrl'];
  for (const field of urlFields) {
    if (stringData[field]) {
      let val = stringData[field] as string;
      if (!/^https?:\/\//i.test(val)) val = `https://${val}`;
      try {
        new URL(val);
        stringData[field] = val;
      }
      catch {
        return Response.json({ error: `Invalid URL for ${field}` }, { status: 422 });
      }
    }
  }

  const data = {
    ...stringData,
    ...(isPublic !== undefined ? { isPublic } : {}),
    ...(showName !== undefined ? { showName } : {}),
  };

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
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
    return Response.json(user);
  }
  catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      return Response.json({ error: 'That username is already taken.' }, { status: 409 });
    }
    throw e;
  }
};
