import { z } from 'zod';

export const postSectionSchema = z.object({
  title: z.string().min(1, 'Section name is required'),
});
export type PostSectionPayload = z.infer<typeof postSectionSchema>;

export type PostSectionResponse = {
  id: string
  shoppingListId: string
  title: string
  orderIndex: number
  createdAt: string
};

export type PutSectionsReorderPayload = {
  sections: Array<{ id: string, orderIndex: number }>
};

export type Params = {
  shoppingListId?: string
};
