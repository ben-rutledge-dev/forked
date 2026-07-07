import { z } from 'zod';

export type ShoppingListRole = 'OWNER' | 'COLLABORATOR';

export type ShoppingListWithStats = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  role: ShoppingListRole
  orderIndex: number
  memberCount: number
  uncheckedCount: number
};

export type PendingShoppingListInvite = {
  id: string
  role: ShoppingListRole
  createdAt: string
  shoppingList: {
    id: string
    title: string
  }
  invitedByUserId: string
};

export type ShoppingListsResponse = {
  lists: ShoppingListWithStats[]
  pending: PendingShoppingListInvite[]
};

export const postShoppingListSchema = z.object({
  title: z.string().min(1, 'List name is required').max(100),
});
export type PostShoppingListPayload = z.infer<typeof postShoppingListSchema>;

export type PostShoppingListResponse = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
};
