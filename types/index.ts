export type RecipeWithRelations = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  authorId: string | null;
  isPublic: boolean;
  forkedFromId: string | null;
  forkCount: number;
  createdAt: Date;
  updatedAt: Date;
  author?: { id: string; name: string | null; isPublic: boolean } | null;
  forkedFrom?: { id: string; title: string; isPublic: boolean } | null;
  ingredients: Ingredient[];
  steps: Step[];
  forks?: { id: string; title: string; description: string | null; author?: { name: string | null; isPublic: boolean } | null }[];
};

export type Ingredient = {
  id: string;
  recipeId: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  orderIndex: number;
};

export type Step = {
  id: string;
  recipeId: string;
  instruction: string;
  imageUrl: string | null;
  timerSeconds: number | null;
  orderIndex: number;
};

export type RecipeFormData = {
  title: string;
  description: string;
  isPublic: boolean;
  coverImageUrl?: string;
  ingredients: IngredientFormData[];
  steps: StepFormData[];
};

export type IngredientFormData = {
  id?: string;
  name: string;
  quantity: string;
  unit: string;
};

export type StepFormData = {
  id?: string;
  instruction: string;
  timerSeconds: number | string;
  imageUrl?: string;
};
