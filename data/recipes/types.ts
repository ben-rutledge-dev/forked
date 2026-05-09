export type RecipeIngredientPayload = {
  name: string
  quantity: string
  unit: string
};

export type RecipeStepPayload = {
  instruction: string
  timerSeconds?: number | string
  imageUrl?: string
};

export type PostRecipePayload = {
  title: string
  description?: string
  isPublic?: boolean
  coverImageUrl?: string
  ingredients?: RecipeIngredientPayload[]
  steps?: RecipeStepPayload[]
};

export type PostRecipeResponse = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  authorId: string | null
  isPublic: boolean
  forkedFromId: string | null
  forkCount: number
  createdAt: string
  updatedAt: string
};
