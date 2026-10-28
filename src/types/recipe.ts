export interface IngredientItem {
  id: string;
  name: string;
  category: 'produce' | 'protein' | 'dairy' | 'grains' | 'canned' | 'spices' | 'sauces' | 'bakery' | 'other';
  quantity?: string;
  expiringSoon?: boolean;
}

export type StrictnessLevel = 'strict' | 'staples' | 'flexible';

export interface FilterPreferences {
  mealType: 'any' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  maxCookTimeMinutes: number; // 0 means any
  dietary: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  appliances: string[];
  strictness: StrictnessLevel;
  servings: number;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  fromPantry: boolean;
  commonSubstitute?: string;
  optional?: boolean;
}

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  timerMinutes?: number;
  chefTip?: string;
}

export interface FlavorProfile {
  savory: number; // 1-10
  sweet: number;
  spicy: number;
  umami: number;
  tangy: number;
}

export interface Recipe {
  id: string;
  title: string;
  tagline: string;
  cuisine: string;
  matchPercentage: number;
  ingredients: RecipeIngredient[];
  missingIngredients: { name: string; amount: string; commonSubstitute?: string }[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  flavorProfile: FlavorProfile;
  highlights: string[];
  instructions: CookingStep[];
  chefNotes: string;
  wasteReductionTip: string;
}

export interface MealPlanDay {
  dayNumber: number;
  dayName: string;
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
  snack?: string;
  wasteReductionFocus: string;
}

export interface MealPlan {
  id: string;
  title: string;
  days: MealPlanDay[];
  groceryList: { item: string; neededFor: string; category: string }[];
  zeroWasteScore: number;
}
