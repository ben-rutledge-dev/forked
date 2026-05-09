export type PostInvitePayload = {
  username: string
  role: 'Owner' | 'Collaborator'
};

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
