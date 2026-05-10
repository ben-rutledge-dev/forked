import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, ext } = await req.json();
  if (!data || !ext) return NextResponse.json({ error: 'Missing data or ext' }, { status: 400 });

  const cleanExt = String(ext).toLowerCase().replace(/[^a-z]/g, '');
  if (!ALLOWED_EXTS.includes(cleanExt)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  const fileBuffer = Buffer.from(String(data), 'base64');
  const filename = `${session.user.id}/${randomUUID()}.${cleanExt}`;
  const mimeType = MIME_TYPES[cleanExt];

  const supabase = await createServerSupabaseClient();
  const { data: uploadData, error } = await supabase.storage
    .from('recipe-images')
    .upload(filename, fileBuffer, { contentType: mimeType, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(uploadData.path);

  return NextResponse.json({ url: publicUrl });
};
