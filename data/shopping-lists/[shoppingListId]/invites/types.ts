// Data
import type { ShoppingListRole } from '@/data/shopping-lists/types';

export type PostShoppingListInvitePayload = {
  username: string
  role: ShoppingListRole
};

export type PostShoppingListInviteResponse = {
  id: string
  shoppingListId: string
  userId: string
  role: ShoppingListRole
  acceptedAt: null
  invitedByUserId: string
  createdAt: string
};

export type Params = {
  shoppingListId?: string
};
