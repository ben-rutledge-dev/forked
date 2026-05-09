import type { PostRecipeResponse } from 'data/recipes/types';

export type PatchVisibilityPayload = {
  isPublic: boolean
};

export type PatchVisibilityResponse = PostRecipeResponse;

export type Params = {
  recipeId?: string
};
