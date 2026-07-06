import { z } from 'zod';
// Data
import type { ShoppingListRole } from '@/data/shopping-lists/types';

export const postShoppingListInviteSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.enum(['OWNER', 'COLLABORATOR']),
});
export type PostShoppingListInvitePayload = z.infer<typeof postShoppingListInviteSchema>;

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
