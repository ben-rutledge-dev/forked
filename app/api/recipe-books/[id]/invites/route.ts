import { NextResponse } from 'next/server';
// Data
import { postInviteSchema } from '@/data/recipe-books/[recipeBookId]/invites/types';
// Lib
import { auth } from '@/lib/auth';
import { parseBody } from '@/lib/parseBody';
import { prisma } from '@/lib/prisma';
// Utils
import { COLLABORATOR, OWNER } from '@/utils/roles';

type Params = { params: Promise<{ id: string }> };

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const inviter = await prisma.recipeBookMember.findUnique({
    where: { recipeBookId_userId: { recipeBookId: id, userId: session.user.id } },
    include: { user: { select: { isPremium: true } } },
  });
  if (!inviter?.acceptedAt || inviter.role !== OWNER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = await parseBody(req, postInviteSchema);
  if (!parsed.success) return parsed.response;
  const { username, role } = parsed.data;

  if (role === OWNER && !inviter.user.isPremium) {
    return NextResponse.json({ error: 'Premium required to invite owners' }, { status: 403 });
  }

  const invitee = await prisma.user.findUnique({ where: { username } });
  if (!invitee) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const existing = await prisma.recipeBookMember.findUnique({
    where: { recipeBookId_userId: { recipeBookId: id, userId: invitee.id } },
  });
  if (existing) return NextResponse.json({ error: 'Already a member or invited' }, { status: 409 });

  const member = await prisma.recipeBookMember.create({
    data: {
      recipeBookId: id,
      userId: invitee.id,
      role: role === OWNER ? OWNER : COLLABORATOR,
      acceptedAt: null,
      invitedByUserId: session.user.id,
    },
  });

  return NextResponse.json(member, { status: 201 });
};
