import { NextResponse } from 'next/server';
// Lib
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const all = await prisma.category.findMany({
    select: { id: true, slug: true, label: true, group: true },
    orderBy: { label: 'asc' },
  });

  const grouped = all.reduce<Record<string, typeof all>>(
    (acc, cat) => {
      (acc[cat.group] ??= []).push(cat);
      return acc;
    },
    {},
  );

  const response = NextResponse.json(grouped);
  response.headers.set('Cache-Control', 'public, max-age=86400');
  return response;
};
