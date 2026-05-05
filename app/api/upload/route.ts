import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
// Lib
import { auth } from '@/lib/auth';

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, ext } = await req.json();
  if (!data || !ext) return NextResponse.json({ error: 'Missing data or ext' }, { status: 400 });

  const cleanExt = String(ext).toLowerCase().replace(/[^a-z]/g, '');
  if (!ALLOWED_EXTS.includes(cleanExt)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}.${cleanExt}`;
  await writeFile(path.join(uploadsDir, filename), Buffer.from(String(data), 'base64'));

  return NextResponse.json({ url: `/uploads/${filename}` });
};
