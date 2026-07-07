import { z } from 'zod';

export const putShoppingListsReorderSchema = z.object({
  lists: z.array(z.object({
    id: z.string(),
    orderIndex: z.number(),
  })),
});
export type PutShoppingListsReorderPayload = z.infer<typeof putShoppingListsReorderSchema>;
