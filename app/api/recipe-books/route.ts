import { NextResponse } from 'next/server';
// Data
import { postRecipeBookSchema } from '@/data/recipe-books/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';
// Utils
import { OWNER } from '@/utils/roles';

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const members = await prisma.recipeBookMember.findMany({
    where: { userId },
    include: {
      recipeBook: {
        include: {
          members: { where: { acceptedAt: { not: null } } },
          entries: true,
        },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  const accepted = members
    .filter(m => m.acceptedAt !== null)
    .map(m => ({
      ...m.recipeBook,
      role: m.role,
      orderIndex: m.orderIndex,
      memberCount: m.recipeBook.members.length,
      recipeCount: m.recipeBook.entries.length,
    }));

  const pending = members
    .filter(m => m.acceptedAt === null)
    .map(m => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt,
      recipeBook: {
        id: m.recipeBook.id,
        title: m.recipeBook.title,
        coverImageUrl: m.recipeBook.coverImageUrl,
      },
      invitedByUserId: m.invitedByUserId,
    }));

  return NextResponse.json({ books: accepted, pending });
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = await parseBody(req, postRecipeBookSchema);
  if (!parsed.success) return parsed.response;
  const { title, description, isPublic, coverImageUrl } = parsed.data;

  const lastMember = await prisma.recipeBookMember.findFirst({
    where: { userId: session.user.id },
    orderBy: { orderIndex: 'desc' },
  });

  const book = await prisma.recipeBook.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      isPublic: Boolean(isPublic),
      coverImageUrl: coverImageUrl || null,
      members: {
        create: {
          userId: session.user.id,
          role: OWNER,
          acceptedAt: new Date(),
          invitedByUserId: session.user.id,
          orderIndex: (lastMember?.orderIndex ?? -1) + 1,
        },
      },
    },
  });

  return NextResponse.json(book, { status: 201 });
};
