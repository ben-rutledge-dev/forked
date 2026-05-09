/**
 * Centralised query key factory.
 * All hooks reference keys from here — never hardcode query key strings in hook files.
 */
export const queryKeys = {
  pool: {
    all: ['pool'] as const,
  },

  recipes: {
    all: ['recipes'] as const,
    mine: () => [...queryKeys.recipes.all, 'mine'] as const,
    detail: (id: string) => [...queryKeys.recipes.all, id] as const,
    forks: (id: string) =>
      [...queryKeys.recipes.detail(id), 'forks'] as const,
  },

  recipeBooks: {
    all: ['recipeBooks'] as const,
    mine: () => [...queryKeys.recipeBooks.all, 'mine'] as const,
    pending: () => [...queryKeys.recipeBooks.all, 'pending'] as const,
    detail: (id: string) => [...queryKeys.recipeBooks.all, id] as const,
    members: (id: string) =>
      [...queryKeys.recipeBooks.detail(id), 'members'] as const,
    entries: (id: string) =>
      [...queryKeys.recipeBooks.detail(id), 'entries'] as const,
    invites: (id: string) =>
      [...queryKeys.recipeBooks.detail(id), 'invites'] as const,
  },

  profile: {
    mine: () => ['profile', 'mine'] as const,
  },
};
