import type { RecipeBook } from 'data/recipe-books/types';

export type BookMemberUser = {
  id: string
  name: string | null
  username: string | null
  avatarUrl: string | null
};

export type BookMember = {
  id: string
  recipeBookId: string
  userId: string
  role: 'Owner' | 'Collaborator'
  acceptedAt: string | null
  invitedByUserId: string
  createdAt: string
  user: BookMemberUser
};

export type BookEntryRecipe = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  forkCount: number
  isPublic: boolean
  authorId: string | null
};

export type BookEntry = {
  id: string
  recipeBookId: string
  recipeId: string
  addedByUserId: string
  orderIndex: number
  createdAt: string
  recipe: BookEntryRecipe
};

export type RecipeBookDetail = RecipeBook & {
  members: BookMember[]
  entries: BookEntry[]
  currentUserRole: 'Owner' | 'Collaborator' | null
};

export type PutRecipeBookPayload = {
  title: string
  description?: string
  isPublic?: boolean
  coverImageUrl?: string
};

export type PutRecipeBookResponse = RecipeBook;

export type Params = {
  recipeBookId?: string
  initialData?: RecipeBookDetail
};
