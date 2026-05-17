export type ShoppingListRole = 'OWNER' | 'COLLABORATOR';

export type ShoppingListWithStats = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  role: ShoppingListRole
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

export type PostShoppingListPayload = {
  title: string
};

export type PostShoppingListResponse = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
};
