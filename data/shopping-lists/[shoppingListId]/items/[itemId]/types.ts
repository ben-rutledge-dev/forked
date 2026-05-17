export type PutItemPayload = {
  name?: string
  checked?: boolean
  sectionId?: string
  orderIndex?: number
};

export type PutItemResponse = {
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

export type Params = {
  shoppingListId?: string
  itemId?: string
};
