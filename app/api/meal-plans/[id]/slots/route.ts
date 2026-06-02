import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
  });
  if (!member?.acceptedAt || member.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { label } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: 'Label required' }, { status: 400 });

  const maxSlot = await prisma.mealPlanSlot.aggregate({
    where: { mealPlanId: id },
    _max: { orderIndex: true },
  });
  const orderIndex = (maxSlot._max.orderIndex ?? -1) + 1;

  const slot = await prisma.mealPlanSlot.create({
    data: { mealPlanId: id, label: label.trim(), isDefault: false, orderIndex },
  });

  return NextResponse.json({ ...slot, createdAt: slot.createdAt.toISOString() }, { status: 201 });
};

export const PUT = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
  });
  if (!member?.acceptedAt || member.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { slots } = await req.json() as { slots: { id: string, orderIndex: number }[] };
  if (!Array.isArray(slots)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  await prisma.$transaction(
    slots.map(s => prisma.mealPlanSlot.update({ where: { id: s.id }, data: { orderIndex: s.orderIndex } })),
  );

  return NextResponse.json({ ok: true });
};
