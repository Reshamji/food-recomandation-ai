import { IngredientItem, FilterPreferences, Recipe, MealPlan } from '../types/recipe';
import { generateFallbackRecipes, generateFallbackMealPlan } from './fallbackData';

export async function fetchRecipeRecommendations(
  ingredients: IngredientItem[],
  preferences: FilterPreferences,
  staples: string[] = ['Salt', 'Water', 'Black Pepper', 'Olive Oil']
): Promise<{ recipes: Recipe[]; source: 'gemini' | 'fallback' }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('/api/recommend-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        ingredients,
        staples,
        dietary: preferences.dietary,
        mealType: preferences.mealType,
        maxCookTimeMinutes: preferences.maxCookTimeMinutes,
        skillLevel: preferences.skillLevel,
        appliances: preferences.appliances,
        strictness: preferences.strictness,
        servings: preferences.servings,
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    if (data.source === 'gemini' && Array.isArray(data.recipes) && data.recipes.length > 0) {
      return { recipes: data.recipes, source: 'gemini' };
    }

    // Use fallback culinary generator
    const fallbacks = generateFallbackRecipes(ingredients, preferences);
    return { recipes: fallbacks, source: 'fallback' };
  } catch (err) {
    console.warn('API error, using local culinary intelligence fallback:', err);
    const fallbacks = generateFallbackRecipes(ingredients, preferences);
    return { recipes: fallbacks, source: 'fallback' };
  }
}

export async function parseFridgeImage(
  imageBase64: string,
  mimeType: string
): Promise<{ detectedItems: Array<Omit<IngredientItem, 'id'>> }> {
  const res = await fetch('/api/parse-pantry-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  if (!res.ok) {
    throw new Error('Failed to analyze pantry photo');
  }

  const data = await res.json();
  return { detectedItems: data.detectedItems || [] };
}

export async function generateWeeklyMealPlan(
  ingredients: IngredientItem[],
  days: number = 3,
  dietary: string[] = [],
  servings: number = 2
): Promise<MealPlan> {
  try {
    const res = await fetch('/api/generate-meal-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, days, dietary, servings }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.plan && data.plan.days) {
        // Map raw plan into typed MealPlan
        const fallback = generateFallbackRecipes(ingredients, {
          mealType: 'any',
          maxCookTimeMinutes: 30,
          dietary,
          skillLevel: 'intermediate',
          appliances: ['Stovetop'],
          strictness: 'staples',
          servings,
        });

        return {
          id: 'gemini-plan-' + Date.now(),
          title: data.plan.title || `${days}-Day Zero-Waste Meal Plan`,
          zeroWasteScore: data.plan.zeroWasteScore || 95,
          days: data.plan.days.map((d: any, index: number) => {
            const baseRecipe = fallback[index % fallback.length] || fallback[0];
            return {
              dayNumber: d.dayNumber || index + 1,
              dayName: d.dayName || `Day ${index + 1}`,
              breakfast: {
                ...baseRecipe,
                id: `b-${index}`,
                title: d.breakfastTitle || `${baseRecipe.title} (Morning)`,
                tagline: d.breakfastDesc || baseRecipe.tagline,
              },
              lunch: {
                ...baseRecipe,
                id: `l-${index}`,
                title: d.lunchTitle || `${baseRecipe.title} (Midday)`,
                tagline: d.lunchDesc || baseRecipe.tagline,
              },
              dinner: {
                ...baseRecipe,
                id: `d-${index}`,
                title: d.dinnerTitle || `${baseRecipe.title} (Evening Feast)`,
                tagline: d.dinnerDesc || baseRecipe.tagline,
              },
              snack: d.snack || 'Roasted spiced seeds or crisp vegetable sticks',
              wasteReductionFocus: d.wasteReductionFocus || 'Use up leftover produce stems and dairy.',
            };
          }),
          groceryList: data.plan.groceryList || [],
        };
      }
    }
  } catch (err) {
    console.warn('Meal plan generation fallback:', err);
  }

  return generateFallbackMealPlan(ingredients);
}

export async function askSousChef(
  recipeTitle: string,
  recipeIngredients: string[],
  currentStep: number | undefined,
  userQuestion: string
): Promise<string> {
  try {
    const res = await fetch('/api/recipe-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeTitle, recipeIngredients, currentStep, userQuestion }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.answer || 'Keep cooking at steady medium heat and taste frequently!';
    }
  } catch (e) {
    console.error('Sous chef error:', e);
  }
  return 'A pinch of salt, a splash of lemon or vinegar, and steady heat will balance almost any dish!';
}
