import { z } from 'zod';

export type RecipeBook = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
};

export type BookWithStats = RecipeBook & {
  role: 'Owner' | 'Collaborator'
  memberCount: number
  recipeCount: number
};

export type PendingInvite = {
  id: string
  role: 'Owner' | 'Collaborator'
  createdAt: string
  recipeBook: {
    id: string
    title: string
    coverImageUrl: string | null
  }
  invitedByUserId: string
};

export type RecipeBooksResponse = {
  books: BookWithStats[]
  pending: PendingInvite[]
};

export const postRecipeBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  isPublic: z.boolean(),
  coverImageUrl: z.string(),
});
export type PostRecipeBookPayload = z.infer<typeof postRecipeBookSchema>;

export type PostRecipeBookResponse = RecipeBook;
