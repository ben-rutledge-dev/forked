export type CategoryGroup = 'CUISINE' | 'MEAL_TYPE' | 'DIETARY' | 'EFFORT';

export type Category = {
  id: string
  slug: string
  label: string
  group: CategoryGroup
};

export type CategoriesResponse = Record<CategoryGroup, Category[]>;
