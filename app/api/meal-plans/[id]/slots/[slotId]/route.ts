import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string, slotId: string }> };

export const PUT = async (req: Request, { params }: Params) => {
  const { id, slotId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
  });
  if (!member?.acceptedAt || member.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const slot = await prisma.mealPlanSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.mealPlanId !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json() as { label?: string, orderIndex?: number };

  const data: { label?: string, orderIndex?: number } = {};
  if (body.orderIndex !== undefined) data.orderIndex = body.orderIndex;
  if (body.label?.trim()) {
    if (slot.isDefault) return NextResponse.json({ error: 'Cannot rename default slots' }, { status: 400 });
    data.label = body.label.trim();
  }

  const updated = await prisma.mealPlanSlot.update({ where: { id: slotId }, data });
  return NextResponse.json({ ...updated, createdAt: updated.createdAt.toISOString() });
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id, slotId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
  });
  if (!member?.acceptedAt || member.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const slot = await prisma.mealPlanSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.mealPlanId !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (slot.isDefault) return NextResponse.json({ error: 'Cannot delete default slots' }, { status: 400 });

  await prisma.mealPlanSlot.delete({ where: { id: slotId } });
  return new NextResponse(null, { status: 204 });
};
