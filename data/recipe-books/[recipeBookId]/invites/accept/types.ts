export type AcceptInviteResponse = {
  id: string
  recipeBookId: string
  userId: string
  role: 'Owner' | 'Collaborator'
  acceptedAt: string
  invitedByUserId: string
  createdAt: string
};

export type Params = {
  recipeBookId?: string
};
