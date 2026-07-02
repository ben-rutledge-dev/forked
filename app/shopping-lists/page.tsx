import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
// Data
import { queryKeys } from '@/data/queryKeys';
import type { ShoppingListRole } from '@/data/shopping-lists/types';
// Components
import { ShoppingListsClient } from './components/ShoppingListsClient';
// Lib
import { auth } from '@/lib/auth';
import { getQueryClient } from '@/lib/getQueryClient';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Shopping Lists' };

const ShoppingListsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id;

  const members = await prisma.shoppingListMember.findMany({
    where: { userId },
    include: {
      shoppingList: {
        include: {
          _count: {
            select: {
              members: { where: { acceptedAt: { not: null } } },
              items: { where: { checked: false } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const lists = members
    .filter(m => m.acceptedAt !== null)
    .map(m => ({
      id: m.shoppingList.id,
      title: m.shoppingList.title,
      createdAt: m.shoppingList.createdAt.toISOString(),
      updatedAt: m.shoppingList.updatedAt.toISOString(),
      role: m.role as ShoppingListRole,
      memberCount: m.shoppingList._count.members,
      uncheckedCount: m.shoppingList._count.items,
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

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.shoppingLists.mine(), { lists, pending });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ShoppingListsClient />
    </HydrationBoundary>
  );
};

export default ShoppingListsPage;
