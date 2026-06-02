import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

const startOfWeek = (d: Date) => {
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const result = new Date(d);
  result.setDate(d.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.mealPlanMember.findUnique({
    where: { mealPlanId_userId: { mealPlanId: id, userId: session.user.id } },
    include: { user: { select: { isPremium: true } } },
  });
  if (!member?.acceptedAt || member.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { slotId, recipeId, date: dateStr } = await req.json();
  if (!slotId || !recipeId || !dateStr) {
    return NextResponse.json({ error: 'slotId, recipeId, and date are required' }, { status: 400 });
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (member.user.isPremium) {
    const maxDate = new Date(startOfWeek(today));
    maxDate.setDate(maxDate.getDate() + 8 * 7 - 1);
    if (date > maxDate) {
      return NextResponse.json({ error: 'Date out of range' }, { status: 400 });
    }
  }
  else {
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 6);
    if (date < today || date > maxDate) {
      return NextResponse.json({ error: 'Date out of range for free plan' }, { status: 400 });
    }
  }

  const maxEntry = await prisma.mealPlanEntry.aggregate({
    where: { mealPlanId: id, slotId, date },
    _max: { orderIndex: true },
  });
  const orderIndex = (maxEntry._max.orderIndex ?? -1) + 1;

  const entry = await prisma.mealPlanEntry.create({
    data: { mealPlanId: id, slotId, recipeId, date, orderIndex },
    include: { recipe: { select: { id: true, title: true, coverImageUrl: true } } },
  });

  return NextResponse.json({
    ...entry,
    date: entry.date.toISOString().split('T')[0],
    createdAt: entry.createdAt.toISOString(),
  }, { status: 201 });
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

  const { entries } = await req.json() as { entries: { id: string, orderIndex: number }[] };
  if (!Array.isArray(entries)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  await prisma.$transaction(
    entries.map(e => prisma.mealPlanEntry.update({ where: { id: e.id }, data: { orderIndex: e.orderIndex } })),
  );

  return NextResponse.json({ ok: true });
};
