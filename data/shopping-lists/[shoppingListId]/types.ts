// Data
import type { ShoppingListRole } from '@/data/shopping-lists/types';

export type ShoppingListMemberUser = {
  id: string
  name: string | null
  username: string | null
  avatarUrl: string | null
};

export type ShoppingListMember = {
  id: string
  shoppingListId: string
  userId: string
  role: ShoppingListRole
  acceptedAt: string | null
  invitedByUserId: string
  createdAt: string
  user: ShoppingListMemberUser
};

export type ShoppingListItem = {
  id: string
  sectionId: string
  shoppingListId: string
  name: string
  checked: boolean
  orderIndex: number
  recipeId: string | null
  recipeTitle: string | null
  createdAt: string
  updatedAt: string
};

export type ShoppingListSection = {
  id: string
  shoppingListId: string
  title: string
  orderIndex: number
  createdAt: string
  items: ShoppingListItem[]
};

export type ShoppingListDetail = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  currentUserRole: ShoppingListRole
  members: ShoppingListMember[]
  sections: ShoppingListSection[]
};

export type PutShoppingListPayload = {
  title: string
};

export type PutShoppingListResponse = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
};

export type Params = {
  shoppingListId?: string
  initialData?: ShoppingListDetail
};
