import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
// Data
import type { ShoppingListRole } from '@/data/shopping-lists/types';
// Components
import { ShoppingListsClient } from './components/ShoppingListsClient';
// Lib
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Shopping Lists' };

const ShoppingListsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;

  const [members, user] = await Promise.all([
    prisma.shoppingListMember.findMany({
      where: { userId },
      include: {
        shoppingList: {
          include: {
            members: { where: { acceptedAt: { not: null } } },
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } }),
  ]);

  const accepted = members
    .filter(m => m.acceptedAt !== null)
    .map(m => ({
      id: m.shoppingList.id,
      title: m.shoppingList.title,
      createdAt: m.shoppingList.createdAt.toISOString(),
      updatedAt: m.shoppingList.updatedAt.toISOString(),
      role: m.role as ShoppingListRole,
      memberCount: m.shoppingList.members.length,
      uncheckedCount: m.shoppingList.items.filter(i => !i.checked).length,
    }));

  const pending = members
    .filter(m => m.acceptedAt === null)
    .map(m => ({
      id: m.id,
      role: m.role as ShoppingListRole,
      createdAt: m.createdAt.toISOString(),
      shoppingList: { id: m.shoppingList.id, title: m.shoppingList.title },
      invitedByUserId: m.invitedByUserId,
    }));

  return (
    <ShoppingListsClient
      initialLists={accepted}
      initialPending={pending}
    />
  );
};

export default ShoppingListsPage;
