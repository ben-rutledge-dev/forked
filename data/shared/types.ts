export type Member = {
  id: string
  userId: string
  role: string
  acceptedAt: string | null
  user: {
    name: string | null
    username: string | null
    avatarUrl: string | null
  }
};

export type PendingInviteItem = {
  id: string
  title: string
  roleLabel: string
};
