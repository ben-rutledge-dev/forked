import { z } from 'zod';

export const putFavouriteRecipesReorderSchema = z.object({
  favourites: z.array(z.object({
    recipeId: z.string(),
    orderIndex: z.number(),
  })),
});
export type PutFavouriteRecipesReorderPayload = z.infer<typeof putFavouriteRecipesReorderSchema>;
