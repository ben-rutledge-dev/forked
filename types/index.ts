export type UserProfile = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isPublic: boolean
  showName: boolean
  username: string | null
  bio: string | null
  avatarUrl: string | null
  coverImageUrl: string | null
  websiteUrl: string | null
  twitterHandle: string | null
  instagramHandle: string | null
  youtubeUrl: string | null
};

export type Recipe = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  authorId: string | null
  isPublic: boolean
  forkedFromId: string | null
  forkCount: number
  tags: string[]
  categories?: { id: string, slug: string, label: string, group: string }[]
};

export type Ingredient = {
  id: string
  recipeId: string
  name: string
  quantity: string | null
  unit: string | null
  orderIndex: number
};

export type Step = {
  id: string
  recipeId: string
  instruction: string
  imageUrl: string | null
  timerSeconds: number | null
  orderIndex: number
};

export type RecipeWithRelations = Recipe & {
  createdAt: Date
  updatedAt: Date
  author?: { id: string, name: string | null, username: string | null, isPublic: boolean } | null
  forkedFrom?: { id: string, title: string, isPublic: boolean } | null
  ingredients: Ingredient[]
  steps: Step[]
  forks?: { id: string, title: string, description: string | null, author?: { name: string | null, username: string | null, isPublic: boolean } | null }[]
  categories?: { id: string, slug: string, label: string, group: string }[]
};

export type RecipeFormData = {
  title: string
  description: string
  isPublic: boolean
  coverImageUrl?: string
  ingredients: IngredientFormData[]
  steps: StepFormData[]
};

export type IngredientFormData = {
  id?: string
  name: string
  quantity: string
  unit: string
};

export type StepFormData = {
  id?: string
  instruction: string
  timerSeconds: number | string
  imageUrl?: string
};
