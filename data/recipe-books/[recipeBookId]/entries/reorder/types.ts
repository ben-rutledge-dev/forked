export type ReorderEntry = {
  id: string
  orderIndex: number
};

export type PutReorderPayload = {
  entries: ReorderEntry[]
};

export type Params = {
  recipeBookId?: string
};
