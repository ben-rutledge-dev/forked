import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const inviter = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
    include: { user: { select: { isPremium: true } } },
  });
  if (!inviter?.acceptedAt || inviter.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!inviter.user.isPremium) {
    return NextResponse.json({ error: 'Premium required to invite collaborators' }, { status: 403 });
  }

  const { username, role } = await req.json() as { username: string, role: 'COLLABORATOR' | 'VIEWER' };
  if (!username?.trim() || !['COLLABORATOR', 'VIEWER'].includes(role)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const invitee = await prisma.user.findUnique({ where: { username: username.trim() }, select: { id: true } });
  if (!invitee) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const existing = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: invitee.id } },
  });
  if (existing) return NextResponse.json({ error: 'Already a member or invited' }, { status: 409 });

  const member = await prisma.mealPlanMember.create({
    data: { mealPlanId: id, userId: invitee.id, role, acceptedAt: null, invitedByUserId: session.user.id },
  });

  return NextResponse.json({ ...member, acceptedAt: null, createdAt: member.createdAt.toISOString() }, { status: 201 });
};
