import { z } from 'zod';
// Types
import type { Recipe } from '@/types';

export type MyRecipesParams = {
  tags?: string[]
  categories?: string[]
};

export type FavouriteRecipe = Recipe & { orderIndex: number };
export type MyRecipe = Recipe & { orderIndex: number };

export const recipeIngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string(),
  unit: z.string().nullable().optional(),
  unitKey: z.string().nullable().optional(),
});
export type RecipeIngredientPayload = z.infer<typeof recipeIngredientSchema>;

export const recipeStepSchema = z.object({
  instruction: z.string().min(1, 'Step instruction is required'),
  timerSeconds: z.union([z.number(), z.string()]).optional(),
  imageUrl: z.string().optional(),
});
export type RecipeStepPayload = z.infer<typeof recipeStepSchema>;

export const postRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  coverImageUrl: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).optional(),
  steps: z.array(recipeStepSchema).optional(),
  tags: z.array(z.string()).optional(),
});
export type PostRecipePayload = z.infer<typeof postRecipeSchema>;

export type PostRecipeResponse = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  authorId: string | null
  isPublic: boolean
  forkedFromId: string | null
  forkCount: number
  tags: string[]
  categories: string[]
  createdAt: string
  updatedAt: string
};

export type PoolRecipesResponse = {
  recipes: {
    id: string
    title: string
    description: string | null
    coverImageUrl: string | null
    forkCount: number
    authorId: string | null
    isPublic: boolean
    forkedFromId: string | null
    tags: string[]
  }[]
  total: number
};

export type PoolParams = {
  categories?: string[]
  q?: string
  page?: number
};
