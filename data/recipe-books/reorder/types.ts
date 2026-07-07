import { z } from 'zod';

export const putRecipeBooksReorderSchema = z.object({
  books: z.array(z.object({
    id: z.string(),
    orderIndex: z.number(),
  })),
});
export type PutRecipeBooksReorderPayload = z.infer<typeof putRecipeBooksReorderSchema>;
