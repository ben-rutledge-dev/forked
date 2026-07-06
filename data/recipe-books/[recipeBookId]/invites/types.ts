import { z } from 'zod';
// Utils
import { OWNER, COLLABORATOR } from '@/utils/roles';

export const postInviteSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.enum([OWNER, COLLABORATOR]),
});
export type PostInvitePayload = z.infer<typeof postInviteSchema>;

export type PostInviteResponse = {
  id: string
  recipeBookId: string
  userId: string
  role: 'Owner' | 'Collaborator'
  acceptedAt: null
  invitedByUserId: string
  createdAt: string
};

export type Params = {
  recipeBookId?: string
};
