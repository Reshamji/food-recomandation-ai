import { IngredientItem } from '../types/recipe';

export interface PresetPantry {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  items: Omit<IngredientItem, 'id'>[];
}

export const PRESET_PANTRIES: PresetPantry[] = [
  {
    id: 'mediterranean',
    name: 'Mediterranean Kitchen',
    badge: 'Fresh & Vibrant',
    icon: '🫒',
    description: 'Tomatoes, feta, pasta, olive oil, chickpeas, garlic, lemon, and spinach.',
    items: [
      { name: 'Cherry Tomatoes', category: 'produce', expiringSoon: true, quantity: '1 cup' },
      { name: 'Baby Spinach', category: 'produce', expiringSoon: true, quantity: '2 handfuls' },
      { name: 'Garlic', category: 'produce', quantity: '4 cloves' },
      { name: 'Lemon', category: 'produce', quantity: '1 whole' },
      { name: 'Feta Cheese', category: 'dairy', quantity: '100g' },
      { name: 'Canned Chickpeas', category: 'canned', quantity: '1 can' },
      { name: 'Spaghetti / Penne', category: 'grains', quantity: '250g' },
      { name: 'Extra Virgin Olive Oil', category: 'sauces', quantity: 'Bottle' },
      { name: 'Dried Oregano', category: 'spices', quantity: 'Pantry' },
    ],
  },
  {
    id: 'clean_fridge',
    name: 'Sunday Fridge Cleanout',
    badge: 'Zero-Waste',
    icon: '🍳',
    description: 'Eggs, cheese, bell pepper, onion, leftover rice, soy sauce, and butter.',
    items: [
      { name: 'Eggs', category: 'dairy', expiringSoon: false, quantity: '4 eggs' },
      { name: 'Cheddar Cheese', category: 'dairy', expiringSoon: true, quantity: 'Half block' },
      { name: 'Bell Pepper', category: 'produce', expiringSoon: true, quantity: '1 large' },
      { name: 'Yellow Onion', category: 'produce', expiringSoon: false, quantity: '1 medium' },
      { name: 'Leftover White Rice', category: 'grains', expiringSoon: true, quantity: '2 cups' },
      { name: 'Butter', category: 'dairy', quantity: '2 tbsp' },
      { name: 'Soy Sauce', category: 'sauces', quantity: 'Pantry' },
      { name: 'Black Pepper', category: 'spices', quantity: 'Pantry' },
    ],
  },
  {
    id: 'asian_stirfry',
    name: 'Quick Asian Pantry',
    badge: 'Flavor-Packed',
    icon: '🍜',
    description: 'Noodles, tofu/chicken, broccoli, ginger, soy sauce, sesame oil, and garlic.',
    items: [
      { name: 'Broccoli', category: 'produce', expiringSoon: true, quantity: '1 head' },
      { name: 'Firm Tofu', category: 'protein', expiringSoon: false, quantity: '1 block' },
      { name: 'Eggs', category: 'dairy', quantity: '2 eggs' },
      { name: 'Fresh Ginger', category: 'produce', quantity: '1 thumb' },
      { name: 'Garlic', category: 'produce', quantity: '3 cloves' },
      { name: 'Egg Noodles / Rice', category: 'grains', quantity: '200g' },
      { name: 'Soy Sauce', category: 'sauces', quantity: 'Pantry' },
      { name: 'Toasted Sesame Oil', category: 'sauces', quantity: 'Pantry' },
      { name: 'Chili Flakes / Sriracha', category: 'sauces', quantity: 'Pantry' },
    ],
  },
  {
    id: 'taco_night',
    name: 'Fiesta & Leftovers',
    badge: 'Crowd Pleaser',
    icon: '🌮',
    description: 'Tortillas, black beans, salsa, lime, cheddar, ground meat or corn, cilantro.',
    items: [
      { name: 'Flour / Corn Tortillas', category: 'bakery', quantity: '6 pieces' },
      { name: 'Canned Black Beans', category: 'canned', quantity: '1 can' },
      { name: 'Cheddar Cheese', category: 'dairy', quantity: '1 cup shredded' },
      { name: 'Salsa', category: 'sauces', expiringSoon: true, quantity: 'Half jar' },
      { name: 'Lime', category: 'produce', quantity: '2 whole' },
      { name: 'Red Onion', category: 'produce', quantity: '1 medium' },
      { name: 'Ground Turkey / Beef', category: 'protein', expiringSoon: true, quantity: '300g' },
      { name: 'Cumin', category: 'spices', quantity: 'Pantry' },
    ],
  },
  {
    id: 'college_dorm',
    name: 'Minimalist Dorm Room',
    badge: '10-Minute Meals',
    icon: '🎒',
    description: 'Ramen pack, eggs, peanut butter, canned tuna, bread, sriracha, and green onions.',
    items: [
      { name: 'Instant Ramen Noodles', category: 'grains', quantity: '2 packs' },
      { name: 'Eggs', category: 'dairy', quantity: '3 eggs' },
      { name: 'Canned Tuna', category: 'protein', quantity: '1 can' },
      { name: 'Peanut Butter', category: 'sauces', quantity: 'Jar' },
      { name: 'Sliced Bread', category: 'bakery', expiringSoon: true, quantity: '4 slices' },
      { name: 'Green Onions', category: 'produce', expiringSoon: true, quantity: '3 stalks' },
      { name: 'Sriracha', category: 'sauces', quantity: 'Pantry' },
    ],
  },
];

export const CATEGORY_LABELS: Record<IngredientItem['category'], { label: string; icon: string; color: string }> = {
  produce: { label: 'Produce & Veggies', icon: '🥦', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  protein: { label: 'Proteins & Seafood', icon: '🥩', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  dairy: { label: 'Dairy & Eggs', icon: '🧀', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  grains: { label: 'Grains & Pasta', icon: '🌾', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30' },
  canned: { label: 'Canned & Legumes', icon: '🥫', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  sauces: { label: 'Oils & Sauces', icon: '🫒', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  spices: { label: 'Herbs & Spices', icon: '🌿', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30' },
  bakery: { label: 'Breads & Bakery', icon: '🍞', color: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/30' },
  other: { label: 'Other', icon: '🧂', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30' },
};

export const POPULAR_INGREDIENTS: Array<{ name: string; category: IngredientItem['category'] }> = [
  // Produce
  { name: 'Garlic', category: 'produce' },
  { name: 'Yellow Onion', category: 'produce' },
  { name: 'Tomatoes', category: 'produce' },
  { name: 'Spinach', category: 'produce' },
  { name: 'Broccoli', category: 'produce' },
  { name: 'Bell Pepper', category: 'produce' },
  { name: 'Carrots', category: 'produce' },
  { name: 'Potatoes', category: 'produce' },
  { name: 'Lemon', category: 'produce' },
  { name: 'Avocado', category: 'produce' },
  { name: 'Zucchini', category: 'produce' },
  { name: 'Mushrooms', category: 'produce' },

  // Dairy & Eggs
  { name: 'Eggs', category: 'dairy' },
  { name: 'Milk', category: 'dairy' },
  { name: 'Butter', category: 'dairy' },
  { name: 'Cheddar Cheese', category: 'dairy' },
  { name: 'Parmesan', category: 'dairy' },
  { name: 'Greek Yogurt', category: 'dairy' },
  { name: 'Heavy Cream', category: 'dairy' },
  { name: 'Mozzarella', category: 'dairy' },

  // Protein
  { name: 'Chicken Breast', category: 'protein' },
  { name: 'Ground Beef', category: 'protein' },
  { name: 'Bacon', category: 'protein' },
  { name: 'Firm Tofu', category: 'protein' },
  { name: 'Canned Tuna', category: 'protein' },
  { name: 'Salmon Fillet', category: 'protein' },
  { name: 'Shrimp', category: 'protein' },
  { name: 'Sausage', category: 'protein' },

  // Grains
  { name: 'White Rice', category: 'grains' },
  { name: 'Spaghetti / Pasta', category: 'grains' },
  { name: 'Rolled Oats', category: 'grains' },
  { name: 'Quinoa', category: 'grains' },
  { name: 'Ramen Noodles', category: 'grains' },

  // Canned & Staples
  { name: 'Canned Chickpeas', category: 'canned' },
  { name: 'Canned Black Beans', category: 'canned' },
  { name: 'Canned Diced Tomatoes', category: 'canned' },
  { name: 'Coconut Milk', category: 'canned' },

  // Oils & Sauces
  { name: 'Olive Oil', category: 'sauces' },
  { name: 'Soy Sauce', category: 'sauces' },
  { name: 'Sriracha / Hot Sauce', category: 'sauces' },
  { name: 'Sesame Oil', category: 'sauces' },
  { name: 'Dijon Mustard', category: 'sauces' },
  { name: 'Honey', category: 'sauces' },
  { name: 'Mayonnaise', category: 'sauces' },

  // Spices
  { name: 'Black Pepper', category: 'spices' },
  { name: 'Cumin', category: 'spices' },
  { name: 'Paprika', category: 'spices' },
  { name: 'Dried Oregano', category: 'spices' },
  { name: 'Chili Powder', category: 'spices' },
  { name: 'Cinnamon', category: 'spices' },
];

export const COMMON_STAPLES = [
  'Salt',
  'Water',
  'Cooking Oil / Olive Oil',
  'Black Pepper',
];
