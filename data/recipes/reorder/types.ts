import { z } from 'zod';

export const putRecipesReorderSchema = z.object({
  recipes: z.array(z.object({
    id: z.string(),
    orderIndex: z.number(),
  })),
});
export type PutRecipesReorderPayload = z.infer<typeof putRecipesReorderSchema>;
