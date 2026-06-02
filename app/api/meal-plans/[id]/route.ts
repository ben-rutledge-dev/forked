import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

const getMemberRole = async (mealPlanId: string, userId: string) => {
  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId, userId } },
  });
  if (!member?.acceptedAt) return null;
  return member.role;
};

export const GET = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await getMemberRole(id, session.user.id);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const plan = await prisma.mealPlan.findUnique({
    where: { id },
    include: {
      slots: { orderBy: { orderIndex: 'asc' } },
      members: {
        where: { acceptedAt: { not: null } },
        include: {
          user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        },
      },
      entries: {
        where: startDate && endDate
          ? { date: { gte: new Date(startDate), lte: new Date(endDate) } }
          : undefined,
        include: {
          recipe: { select: { id: true, title: true, coverImageUrl: true } },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    ...plan,
    currentUserRole: role,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    slots: plan.slots.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })),
    entries: plan.entries.map(e => ({
      ...e,
      date: e.date.toISOString().split('T')[0],
      createdAt: e.createdAt.toISOString(),
    })),
    members: plan.members.map(m => ({
      ...m,
      acceptedAt: m.acceptedAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
  });
};

export const PUT = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await getMemberRole(id, session.user.id);
  if (role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const plan = await prisma.mealPlan.update({
    where: { id },
    data: { title: title.trim() },
  });

  return NextResponse.json({ ...plan, createdAt: plan.createdAt.toISOString(), updatedAt: plan.updatedAt.toISOString() });
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await getMemberRole(id, session.user.id);
  if (role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.mealPlan.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
};
