export type PostSectionPayload = {
  title: string
};

export type PostSectionResponse = {
  id: string
  shoppingListId: string
  title: string
  orderIndex: number
  createdAt: string
};

export type PutSectionsReorderPayload = {
  sections: Array<{ id: string, orderIndex: number }>
};

export type Params = {
  shoppingListId?: string
};
