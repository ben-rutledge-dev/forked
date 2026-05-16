// Data
import type { Category } from '@/data/categories/types';
import type { PostRecipeResponse, RecipeIngredientPayload, RecipeStepPayload, PostRecipePayload } from '@/data/recipes/types';

export type RecipeAuthor = {
  id: string
  name: string | null
  username: string | null
  isPublic: boolean
};

export type ForkedFrom = {
  id: string
  title: string
  isPublic: boolean
};

export type Ingredient = {
  id: string
  recipeId: string
  name: string
  quantity: number | null
  unit: string | null
  unitKey: string | null
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

export type RecipeFork = {
  id: string
  title: string
  description: string | null
  author: {
    name: string | null
    username: string | null
    isPublic: boolean
  } | null
};

export type Recipe = PostRecipeResponse & {
  author: RecipeAuthor | null
  forkedFrom: ForkedFrom | null
  ingredients: Ingredient[]
  steps: Step[]
  forks: RecipeFork[]
  categories: Category[]
  tags: string[]
};

export type PutRecipePayload = PostRecipePayload & {
  categoryIds?: string[]
  tags?: string[]
};

export type PutRecipeIngredientPayload = RecipeIngredientPayload;

export type PutRecipeStepPayload = RecipeStepPayload;

export type PutRecipeResponse = PostRecipeResponse;

export type Params = {
  recipeId?: string
  initialData?: Recipe
};
