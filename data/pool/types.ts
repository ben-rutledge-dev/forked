export type PoolRecipe = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  forkCount: number
  authorId: string | null
  isPublic: boolean
  forkedFromId: string | null
};

export type PoolResponse = {
  recipes: PoolRecipe[]
  total: number
};

export type Params = {
  initialData?: PoolResponse
};
