export const OWNER = "Owner" as const;
export const COLLABORATOR = "Collaborator" as const;

export type Role = typeof OWNER | typeof COLLABORATOR;
