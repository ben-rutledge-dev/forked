export type SuggestionsParams = {
  userId?: string
  isPremium?: boolean
  initialData?: SuggestionsResponse
};

export type SuggestionsResponse = {
  suggestions: string[]
};

export type DismissPayload = {
  userId?: string
  ingredientName: string
  permanent: boolean
};

export type DeleteDismissPayload = {
  userId?: string
  ingredientName: string
};
