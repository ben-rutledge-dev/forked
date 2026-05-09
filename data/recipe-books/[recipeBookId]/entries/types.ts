export type PostEntryPayload = {
  recipeId: string
};

export type PostEntryResponse = {
  id: string
  recipeBookId: string
  recipeId: string
  addedByUserId: string
  orderIndex: number
  createdAt: string
};

export type Params = {
  recipeBookId?: string
};
