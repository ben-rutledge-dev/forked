import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const inviter = await prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: id, userId: session.user.id } },
    include: { user: { select: { isPremium: true } } },
  });
  if (!inviter?.acceptedAt || inviter.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!inviter.user.isPremium) {
    return NextResponse.json({ error: 'Premium required to invite collaborators' }, { status: 403 });
  }

  const { username, role } = await req.json() as { username: string, role: 'OWNER' | 'COLLABORATOR' };

  if (role === 'OWNER') {
    const invitee = await prisma.user.findUnique({ where: { username }, select: { id: true, isPremium: true } });
    if (!invitee) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!invitee.isPremium) {
      return NextResponse.json({ error: 'Invitee must be premium to be an owner' }, { status: 403 });
    }

    const existing = await prisma.shoppingListMember.findUnique({
      where: { shoppingListId_userId: { shoppingListId: id, userId: invitee.id } },
    });
    if (existing) return NextResponse.json({ error: 'Already a member or invited' }, { status: 409 });

    const member = await prisma.shoppingListMember.create({
      data: { shoppingListId: id, userId: invitee.id, role: 'OWNER', acceptedAt: null, invitedByUserId: session.user.id },
    });
    return NextResponse.json(member, { status: 201 });
  }

  const invitee = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!invitee) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const existing = await prisma.shoppingListMember.findUnique({
    where: { shoppingListId_userId: { shoppingListId: id, userId: invitee.id } },
  });
  if (existing) return NextResponse.json({ error: 'Already a member or invited' }, { status: 409 });

  const member = await prisma.shoppingListMember.create({
    data: { shoppingListId: id, userId: invitee.id, role: 'COLLABORATOR', acceptedAt: null, invitedByUserId: session.user.id },
  });
  return NextResponse.json(member, { status: 201 });
};
