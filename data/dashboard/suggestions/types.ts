export type Suggestion = {
  name: string
  recipes: string[]
};

export type SuggestionsParams = {
  userId?: string
  isPremium?: boolean
  initialData?: SuggestionsResponse
};

export type SuggestionsResponse = {
  suggestions: Suggestion[]
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
