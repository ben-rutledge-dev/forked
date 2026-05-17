export type PutSectionPayload = {
  title?: string
  orderIndex?: number
};

export type PutSectionResponse = {
  id: string
  shoppingListId: string
  title: string
  orderIndex: number
  createdAt: string
};

export type Params = {
  shoppingListId?: string
  sectionId?: string
};
