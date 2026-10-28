import { Recipe, IngredientItem, FilterPreferences, MealPlan } from '../types/recipe';

/**
 * Intelligent client/server fallback generator when Gemini API is unavailable or rate-limited.
 * Produces realistic, culinary-sound recipes with authentic steps, macros, and pantry match scores.
 */
export function generateFallbackRecipes(
  ingredients: IngredientItem[],
  preferences: FilterPreferences
): Recipe[] {
  const names = ingredients.map((i) => i.name.toLowerCase());
  const expiringNames = ingredients.filter((i) => i.expiringSoon).map((i) => i.name);
  const ingredientCount = ingredients.length;

  const hasEggs = names.some((n) => n.includes('egg'));
  const hasCheese = names.some((n) => n.includes('cheese') || n.includes('cheddar') || n.includes('feta') || n.includes('parmesan'));
  const hasRice = names.some((n) => n.includes('rice'));
  const hasPasta = names.some((n) => n.includes('pasta') || n.includes('spaghetti') || n.includes('penne') || n.includes('noodle'));
  const hasTomato = names.some((n) => n.includes('tomato'));
  const hasGarlic = names.some((n) => n.includes('garlic'));
  const hasChicken = names.some((n) => n.includes('chicken'));
  const hasBeef = names.some((n) => n.includes('beef') || n.includes('turkey') || n.includes('meat'));
  const hasTofu = names.some((n) => n.includes('tofu'));
  const hasBeans = names.some((n) => n.includes('bean') || n.includes('chickpea'));
  const hasBread = names.some((n) => n.includes('bread') || n.includes('tortilla'));
  const hasSoySauce = names.some((n) => n.includes('soy'));

  const recipes: Recipe[] = [];

  // Recipe 1: Skillet / Sauté / Scramble / Fried Rice
  if (hasRice && (hasEggs || hasSoySauce || hasChicken || hasTofu)) {
    recipes.push({
      id: 'golden-skillet-fried-rice',
      title: 'Golden Pantry Fried Rice & Crispy Aromatics',
      tagline: 'High-heat wok-style rice bursting with savory umami and caramelized veggies.',
      cuisine: 'Asian Fusion',
      matchPercentage: Math.min(100, Math.round((5 / Math.max(5, ingredientCount)) * 100)),
      prepTimeMinutes: 8,
      cookTimeMinutes: 12,
      totalTimeMinutes: 20,
      servings: preferences.servings || 2,
      difficulty: 'Easy',
      calories: 420,
      proteinGrams: hasEggs || hasChicken ? 22 : 12,
      carbsGrams: 58,
      fatGrams: 14,
      fiberGrams: 4,
      flavorProfile: { savory: 9, sweet: 3, spicy: 5, umami: 9, tangy: 2 },
      highlights: ['One Skillet', '15-Minute Wonder', 'Zero Waste Hero', 'Naturally Dairy-Free'],
      ingredients: [
        { name: 'Cold Cooked Rice', amount: '2 cups', fromPantry: true },
        { name: 'Eggs', amount: '2 large', fromPantry: hasEggs, commonSubstitute: 'Crumbled tofu' },
        { name: 'Garlic & Onion', amount: 'Finely minced', fromPantry: hasGarlic },
        { name: 'Available Pantry Veggies', amount: '1-2 cups chopped', fromPantry: true },
        { name: 'Soy Sauce', amount: '2 tbsp', fromPantry: hasSoySauce, commonSubstitute: 'Tamari or pinch of salt' },
        { name: 'Toasted Sesame or Cooking Oil', amount: '1 tbsp', fromPantry: true },
      ],
      missingIngredients: !hasSoySauce
        ? [{ name: 'Soy Sauce', amount: '2 tbsp', commonSubstitute: 'Salt & pinch of sugar' }]
        : [],
      instructions: [
        {
          stepNumber: 1,
          instruction: 'Break up any cold rice clumps with slightly damp fingers so grains separate freely.',
          timerMinutes: 2,
          chefTip: 'Day-old refrigerated rice yields the crispest, least mushy texture.',
        },
        {
          stepNumber: 2,
          instruction: 'Heat 1 tbsp oil in a large skillet over medium-high heat. Sauté aromatics (garlic, onions, sliced vegetables) until tender-crisp.',
          timerMinutes: 4,
          chefTip: 'Keep ingredients moving quickly to prevent garlic from burning.',
        },
        {
          stepNumber: 3,
          instruction: 'Push vegetables to one side, pour beaten eggs into the empty space, and softly scramble until 80% set.',
          timerMinutes: 2,
        },
        {
          stepNumber: 4,
          instruction: 'Dump in the rice, drizzle soy sauce around the rim of the pan so it sizzles, and toss everything vigorously on high heat for 3 minutes.',
          timerMinutes: 3,
          chefTip: 'Let the rice sit untouched for 45 seconds at the end for delicious toasted golden crust at the bottom!',
        },
      ],
      chefNotes: 'Add whatever crisp greens or leftover proteins you have. Sriracha or chili crisp adds a tremendous finish.',
      wasteReductionTip: 'Any limp celery, wrinkly bell peppers, or broccoli stems dice up beautifully in fried rice.',
    });
  } else if (hasEggs) {
    recipes.push({
      id: 'chef-garden-frittata',
      title: 'Rustic Farmer’s Skillet Frittata',
      tagline: 'Velvety baked egg custard loaded with tender veggies and melted cheese.',
      cuisine: 'Mediterranean',
      matchPercentage: 92,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      totalTimeMinutes: 25,
      servings: preferences.servings || 2,
      difficulty: 'Easy',
      calories: 340,
      proteinGrams: 24,
      carbsGrams: 8,
      fatGrams: 22,
      flavorProfile: { savory: 8, sweet: 2, spicy: 3, umami: 8, tangy: 4 },
      highlights: ['Keto Friendly', 'High Protein', 'Gluten Free', 'Great for Meal Prep'],
      ingredients: [
        { name: 'Eggs', amount: '5 large', fromPantry: true },
        { name: 'Chopped Veggies (Spinach, Pepper, Onion)', amount: '1.5 cups', fromPantry: true },
        { name: 'Cheese (Cheddar/Feta/Parmesan)', amount: '1/2 cup', fromPantry: hasCheese, commonSubstitute: 'Nutritional yeast' },
        { name: 'Olive Oil or Butter', amount: '1 tbsp', fromPantry: true },
        { name: 'Black Pepper & Salt', amount: 'To taste', fromPantry: true },
      ],
      missingIngredients: !hasCheese
        ? [{ name: 'Cheese', amount: '1/2 cup', commonSubstitute: 'A dash of olive oil and herbs' }]
        : [],
      instructions: [
        {
          stepNumber: 1,
          instruction: 'Whisk eggs vigorously in a bowl with a pinch of salt and black pepper until frothy.',
          timerMinutes: 1,
          chefTip: 'Whisking introduces air bubbles, giving your frittata an airy, soufflé-like lift.',
        },
        {
          stepNumber: 2,
          instruction: 'Heat olive oil in an oven-safe nonstick or cast iron skillet. Sauté veggies until soft and water has evaporated.',
          timerMinutes: 5,
        },
        {
          stepNumber: 3,
          instruction: 'Pour the whisked eggs over the vegetables, stir gently once, then let cook undisturbed on low heat for 5 minutes until edges set.',
          timerMinutes: 5,
        },
        {
          stepNumber: 4,
          instruction: 'Scatter cheese on top, cover with a lid (or broil in oven at 400°F) for 4 minutes until puffed and golden.',
          timerMinutes: 4,
        },
      ],
      chefNotes: 'Serve warm or chill for tomorrow’s grab-and-go breakfast slices.',
      wasteReductionTip: 'Expiring herbs, spinach, or sad tomatoes are perfect here—moisture cooks right off.',
    });
  }

  // Recipe 2: Pasta or Grain Bowl
  if (hasPasta || hasTomato || hasGarlic) {
    recipes.push({
      id: 'sun-drenched-pantry-pasta',
      title: 'Tuscan Garlic & Blistered Tomato Pasta',
      tagline: 'Silky pasta emulsified in aromatic garlic olive oil, sweet bursts of tomato, and herbs.',
      cuisine: 'Italian',
      matchPercentage: 90,
      prepTimeMinutes: 5,
      cookTimeMinutes: 12,
      totalTimeMinutes: 17,
      servings: preferences.servings || 2,
      difficulty: 'Easy',
      calories: 460,
      proteinGrams: 14,
      carbsGrams: 72,
      fatGrams: 14,
      fiberGrams: 5,
      flavorProfile: { savory: 8, sweet: 4, spicy: 3, umami: 7, tangy: 6 },
      highlights: ['Under 20 Mins', 'Comfort Food Classic', 'Vegetarian Star'],
      ingredients: [
        { name: 'Pasta (Spaghetti, Penne or Linguine)', amount: '200g', fromPantry: hasPasta, commonSubstitute: 'Rice or zoodles' },
        { name: 'Tomatoes (Cherry or Diced)', amount: '1 cup', fromPantry: hasTomato },
        { name: 'Garlic cloves', amount: '3-4 thinly sliced', fromPantry: hasGarlic },
        { name: 'Olive Oil', amount: '2 tbsp', fromPantry: true },
        { name: 'Parmesan or Feta Cheese', amount: '1/3 cup', fromPantry: hasCheese, optional: true },
        { name: 'Pasta Water', amount: '1/3 cup starchy liquid', fromPantry: true },
      ],
      missingIngredients: !hasPasta
        ? [{ name: 'Pasta', amount: '200g', commonSubstitute: 'Couscous, rice, or flatbread' }]
        : [],
      instructions: [
        {
          stepNumber: 1,
          instruction: 'Boil pasta in generously salted water until 1 minute shy of al dente. Reserve 1/2 cup of starchy pasta water before draining.',
          timerMinutes: 9,
          chefTip: 'Never rinse your pasta! The surface starch is what binds your pan sauce into glossy velvet.',
        },
        {
          stepNumber: 2,
          instruction: 'In a skillet over medium-low heat, gently sizzle sliced garlic in olive oil until fragrant and pale blond (do not brown).',
          timerMinutes: 2,
        },
        {
          stepNumber: 3,
          instruction: 'Toss in tomatoes and turn heat to medium-high until skins blister and juices release into a rich sauce.',
          timerMinutes: 4,
        },
        {
          stepNumber: 4,
          instruction: 'Add hot pasta and 1/4 cup reserved pasta water to the skillet. Swirl and toss vigorously until a glossy coating forms.',
          timerMinutes: 2,
        },
      ],
      chefNotes: 'Finish with a crack of fresh black pepper and fresh lemon juice if on hand.',
      wasteReductionTip: 'If your cherry tomatoes are slightly soft or wrinkly, roasting/blistering concentrates their natural sweetness!',
    });
  }

  // Recipe 3: Crisp Melt, Toast, or Quesadilla
  if (hasBread || hasCheese || hasBeans) {
    recipes.push({
      id: 'golden-crunch-pantry-melt',
      title: 'Artisan Crispy Stuffed Panini / Quesadilla',
      tagline: 'Buttery golden-brown crunch outside, molten savory goodness inside with pantry spices.',
      cuisine: 'Casual Bistro',
      matchPercentage: 94,
      prepTimeMinutes: 5,
      cookTimeMinutes: 8,
      totalTimeMinutes: 13,
      servings: preferences.servings || 1,
      difficulty: 'Easy',
      calories: 390,
      proteinGrams: 18,
      carbsGrams: 36,
      fatGrams: 20,
      flavorProfile: { savory: 9, sweet: 2, spicy: 4, umami: 8, tangy: 3 },
      highlights: ['Ultra Quick 10m', 'Comfort Food', 'Kid Approved'],
      ingredients: [
        { name: 'Bread slices or Tortillas', amount: '2 pieces', fromPantry: hasBread },
        { name: 'Melty Cheese', amount: '1/2 cup', fromPantry: hasCheese },
        { name: 'Pantry Fillings (Beans, Protein, or Veggies)', amount: '1/3 cup', fromPantry: true },
        { name: 'Butter or Mayonnaise', amount: '1 tbsp for spread', fromPantry: true },
      ],
      missingIngredients: [],
      instructions: [
        {
          stepNumber: 1,
          instruction: 'Spread a thin film of butter or mayonnaise on the exterior sides of the bread/tortilla.',
          timerMinutes: 1,
          chefTip: 'Mayonnaise creates a more evenly golden, shatteringly crisp crust with higher smoke point than butter!',
        },
        {
          stepNumber: 2,
          instruction: 'Layer half the cheese, then your chopped warm fillings, then remaining cheese to seal.',
          timerMinutes: 2,
        },
        {
          stepNumber: 3,
          instruction: 'Cook in a preheated dry skillet over medium-low heat until the bottom is deeply golden.',
          timerMinutes: 4,
        },
        {
          stepNumber: 4,
          instruction: 'Flip carefully, press gently with spatula, and cook until cheese is completely melted and bubbling.',
          timerMinutes: 3,
        },
      ],
      chefNotes: 'Serve with any leftover salsa, spicy mayo, or plain yogurt seasoned with cumin.',
      wasteReductionTip: 'Stale bread crisps up even better than fresh bread when pressed in a hot skillet.',
    });
  }

  // Recipe 4: Mediterranean Zero-Waste Chickpea / Protein Power Bowl
  recipes.push({
    id: 'lemon-herb-power-bowl',
    title: 'Warm Herb-Roasted Pantry Protein Bowl',
    tagline: 'Hearty warm grains or legumes dressed in zesty citrus vinaigrette with crunchy toppings.',
    cuisine: 'Healthy Mediterranean',
    matchPercentage: 88,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    servings: preferences.servings || 2,
    difficulty: 'Easy',
    calories: 450,
    proteinGrams: 21,
    carbsGrams: 52,
    fatGrams: 18,
    fiberGrams: 9,
    flavorProfile: { savory: 8, sweet: 3, spicy: 2, umami: 7, tangy: 9 },
    highlights: ['High Fiber', 'Clean Eating', 'Great for Leftovers', 'Zero Cooking Stress'],
    ingredients: [
      { name: 'Chickpeas or Cooked Grains', amount: '1 can or 1.5 cups', fromPantry: hasBeans || hasRice },
      { name: 'Crisp or Roasted Vegetables', amount: '1.5 cups', fromPantry: true },
      { name: 'Olive Oil', amount: '2 tbsp', fromPantry: true },
      { name: 'Lemon Juice or Vinegar', amount: '1 tbsp', fromPantry: true },
      { name: 'Herbs & Garlic', amount: '1 tsp dried or fresh', fromPantry: hasGarlic },
      { name: 'Optional Crumbled Feta / Nuts', amount: '2 tbsp', fromPantry: hasCheese, optional: true },
    ],
    missingIngredients: [],
    instructions: [
      {
        stepNumber: 1,
        instruction: 'Pat legumes/veggies completely dry with a paper towel and toss with olive oil and spices.',
        timerMinutes: 2,
        chefTip: 'Dry legumes = ultra crispy roasting instead of steaming.',
      },
      {
        stepNumber: 2,
        instruction: 'Roast in an air fryer at 390°F or skillet on medium-high until crunchy on the outside.',
        timerMinutes: 10,
      },
      {
        stepNumber: 3,
        instruction: 'Whisk olive oil, lemon juice, minced garlic, and a pinch of salt to make a rapid emulsion dressing.',
        timerMinutes: 2,
      },
      {
        stepNumber: 4,
        instruction: 'Assemble warm bowls: spoon grains/beans, top with blistered veggies, drizzle dressing, and garnish.',
        timerMinutes: 2,
      },
    ],
    chefNotes: 'Top with pickled onions, sunflower seeds, or avocado if on hand.',
    wasteReductionTip: 'Stems from herbs like cilantro or parsley have intense flavor; chop them finely into the vinaigrette.',
  });

  // Filter recipes based on max cook time if specified
  let filtered = recipes;
  if (preferences.maxCookTimeMinutes > 0) {
    filtered = recipes.filter((r) => r.totalTimeMinutes <= preferences.maxCookTimeMinutes);
    if (filtered.length === 0) filtered = recipes; // fallback to closest
  }

  return filtered;
}

export function generateFallbackMealPlan(ingredients: IngredientItem[]): MealPlan {
  const fallback = generateFallbackRecipes(ingredients, {
    mealType: 'any',
    maxCookTimeMinutes: 30,
    dietary: [],
    skillLevel: 'beginner',
    appliances: ['Stovetop'],
    strictness: 'staples',
    servings: 2,
  });

  return {
    id: 'zero-waste-3day',
    title: '3-Day Zero-Waste Pantry Optimization Plan',
    zeroWasteScore: 94,
    days: [
      {
        dayNumber: 1,
        dayName: 'Day 1: Priority Freshness',
        breakfast: fallback[0] || fallback[fallback.length - 1],
        lunch: fallback[1] || fallback[0],
        dinner: fallback[2] || fallback[0],
        snack: 'Toasted spiced chickpeas or herb dip',
        wasteReductionFocus: 'Utilize delicate leafy greens and ripe produce first before they wilt.',
      },
      {
        dayNumber: 2,
        dayName: 'Day 2: Smart Repurpose',
        breakfast: fallback[1] || fallback[0],
        lunch: fallback[2] || fallback[0],
        dinner: fallback[0] || fallback[1],
        snack: 'Crispy vegetable scrap chips with sea salt',
        wasteReductionFocus: 'Incorporate leftover roasted aromatics into a quick glossy pasta or grain toss.',
      },
      {
        dayNumber: 3,
        dayName: 'Day 3: Pantry Cleared Out',
        breakfast: fallback[2] || fallback[0],
        lunch: fallback[0] || fallback[1],
        dinner: fallback[1] || fallback[2],
        snack: 'Golden spiced pan toast',
        wasteReductionFocus: 'Finish all open dairy, open cans, and sauces. Zero food left behind!',
      },
    ],
    groceryList: [
      { item: 'Fresh Lemons (2)', neededFor: 'Vinaigrettes & finishing brightness', category: 'Produce' },
      { item: 'Greek Yogurt or Sour Cream', neededFor: 'Sauces and creamy breakfast bowls', category: 'Dairy' },
      { item: 'Cracked Black Pepper', neededFor: 'General seasoning', category: 'Pantry' },
    ],
  };
}
