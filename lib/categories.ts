export const GROUP_LABELS: Record<string, string> = {
  CUISINE: 'Cuisine',
  MEAL_TYPE: 'Meal type',
  DIETARY: 'Dietary',
  EFFORT: 'Effort',
  MY_TAGS: 'My Tags',
};

/** Full order including MY_TAGS — for TokenInput dropdowns */
export const GROUP_ORDER = ['CUISINE', 'MEAL_TYPE', 'DIETARY', 'EFFORT', 'MY_TAGS'] as const;

/** Category-only order — for indexing into CategoriesResponse */
export const CATEGORY_GROUP_ORDER = ['CUISINE', 'MEAL_TYPE', 'DIETARY', 'EFFORT'] as const;
