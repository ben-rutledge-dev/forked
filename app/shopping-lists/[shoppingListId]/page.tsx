import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
// Data
import type { ShoppingListRole } from '@/data/shopping-lists/types';
// Components
import { ShoppingListDetailClient } from './components/ShoppingListDetailClient';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ shoppingListId: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { shoppingListId } = await params;
  const list = await prisma.shoppingList.findUnique({ where: { id: shoppingListId }, select: { title: true } });
  return { title: list?.title ?? 'Shopping List' };
};

const ShoppingListDetailPage = async ({ params }: Props) => {
  const { shoppingListId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;

  const [list, user] = await Promise.all([
    prisma.shoppingList.findUnique({
      where: { id: shoppingListId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            items: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } }),
  ]);

  if (!list) notFound();

  const member = list.members.find(m => m.userId === userId);
  if (!member?.acceptedAt) {
    if (member) redirect('/shopping-lists');
    notFound();
  }

  const listData = {
    id: list.id,
    title: list.title,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    currentUserRole: member.role as ShoppingListRole,
    members: list.members.map(m => ({
      id: m.id,
      shoppingListId: m.shoppingListId,
      userId: m.userId,
      role: m.role as ShoppingListRole,
      acceptedAt: m.acceptedAt?.toISOString() ?? null,
      invitedByUserId: m.invitedByUserId,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    })),
    sections: list.sections.map(s => ({
      id: s.id,
      shoppingListId: s.shoppingListId,
      title: s.title,
      orderIndex: s.orderIndex,
      createdAt: s.createdAt.toISOString(),
      items: s.items.map(i => ({
        id: i.id,
        sectionId: i.sectionId,
        shoppingListId: i.shoppingListId,
        name: i.name,
        checked: i.checked,
        orderIndex: i.orderIndex,
        recipeId: i.recipeId,
        recipeTitle: i.recipeTitle,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      })),
    })),
  };

  return (
    <ShoppingListDetailClient
      list={listData}
      currentUserId={userId}
      isPremium={user?.isPremium ?? false}
    />
  );
};

export default ShoppingListDetailPage;
