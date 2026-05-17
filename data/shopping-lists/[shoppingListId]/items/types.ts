export type PostItemsPayload = {
  items: Array<{
    name: string
    sectionId: string
    recipeId?: string
    recipeTitle?: string
  }>
};

export type PostItemsResponse = Array<{
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
}>;

export type PutItemsReorderPayload = {
  items: Array<{ id: string, orderIndex: number }>
};

export type PutItemSectionPayload = {
  itemId: string
  sectionId: string
};

export type Params = {
  shoppingListId?: string
};
