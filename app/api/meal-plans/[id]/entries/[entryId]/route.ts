import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string, entryId: string }> };

export const PATCH = async (req: Request, { params }: Params) => {
  const { id, entryId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
  });
  if (!member?.acceptedAt || member.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const entry = await prisma.mealPlanEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.mealPlanId !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { slotId, date: dateStr, orderIndex } = await req.json() as { slotId: string, date: string, orderIndex: number };

  const slot = await prisma.mealPlanSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.mealPlanId !== id) return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  // Fetch the other entries already in the target slot+day (sorted by current orderIndex).
  // We reindex them atomically together with the moved entry so there are no orderIndex
  // collisions after the move, which would cause non-deterministic ordering on refetch.
  const siblings = await prisma.mealPlanEntry.findMany({
    where: { mealPlanId: id, slotId, date, id: { not: entryId } },
    orderBy: { orderIndex: 'asc' },
    select: { id: true },
  });

  // Insert the moved entry id at the requested position, then reindex the full list.
  const orderedIds = siblings.map(e => e.id);
  orderedIds.splice(Math.min(orderIndex, orderedIds.length), 0, entryId);

  const updates = orderedIds.map((eid, i) =>
    eid === entryId
      ? prisma.mealPlanEntry.update({ where: { id: eid }, data: { slotId, date, orderIndex: i }, include: { recipe: { select: { id: true, title: true, coverImageUrl: true } } } })
      : prisma.mealPlanEntry.update({ where: { id: eid }, data: { orderIndex: i } }),
  );

  const results = await prisma.$transaction(updates);
  const updated = results.find(r => r.id === entryId)!;

  return NextResponse.json({
    ...updated,
    date: updated.date.toISOString().split('T')[0],
    createdAt: updated.createdAt.toISOString(),
  });
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id, entryId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
  });
  if (!member?.acceptedAt || member.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const entry = await prisma.mealPlanEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.mealPlanId !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.mealPlanEntry.delete({ where: { id: entryId } });
  return new NextResponse(null, { status: 204 });
};
