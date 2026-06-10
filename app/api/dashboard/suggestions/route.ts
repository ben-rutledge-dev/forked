import { NextResponse } from 'next/server';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

const addDaysStr = (dateStr: string, days: number) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().split('T')[0];
};

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });

  if (!user?.isPremium) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const membership = await prisma.mealPlanMember.findFirst({
    where: { userId, acceptedAt: { not: null } },
    orderBy: { createdAt: 'asc' },
  });

  if (!membership) return NextResponse.json({ suggestions: [] });

  const todayStr = toDateStr(new Date());
  const endStr = addDaysStr(todayStr, 6);

  const [entries, dismissals] = await Promise.all([
    prisma.mealPlanEntry.findMany({
      where: {
        mealPlanId: membership.mealPlanId,
        date: { gte: new Date(todayStr), lte: new Date(endStr) },
        recipeId: { not: null },
      },
      include: {
        recipe: { include: { ingredients: { select: { name: true } } } },
      },
    }),
    prisma.mealPlanSuggestionDismissal.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { ingredientName: true },
    }),
  ]);

  const dismissed = new Set(dismissals.map((d: { ingredientName: string }) => d.ingredientName.toLowerCase().trim()));

  const seen = new Set<string>();
  const suggestions: string[] = [];

  for (const entry of entries) {
    for (const ing of entry.recipe?.ingredients ?? []) {
      const key = ing.name.toLowerCase().trim();
      if (key && !seen.has(key) && !dismissed.has(key)) {
        seen.add(key);
        suggestions.push(ing.name.trim());
      }
    }
  }

  return NextResponse.json({ suggestions });
};
