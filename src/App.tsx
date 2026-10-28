/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PantryManager } from './components/PantryManager';
import { FilterControls } from './components/FilterControls';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { FridgeScannerModal } from './components/FridgeScannerModal';
import { MealPlannerView } from './components/MealPlannerView';
import { SavedRecipesView } from './components/SavedRecipesView';
import { IngredientItem, FilterPreferences, Recipe } from './types/recipe';
import { PRESET_PANTRIES } from './data/commonIngredients';
import { fetchRecipeRecommendations } from './services/api';
import { Sparkles, Leaf, ChefHat, RefreshCw, Flame, Check } from 'lucide-react';

const INITIAL_INGREDIENTS: IngredientItem[] = [
  { id: '1', name: 'Eggs', category: 'dairy', quantity: '4 eggs', expiringSoon: false },
  { id: '2', name: 'Baby Spinach', category: 'produce', quantity: '1 fresh bag', expiringSoon: true },
  { id: '3', name: 'Cheddar Cheese', category: 'dairy', quantity: 'Half block', expiringSoon: true },
  { id: '4', name: 'Cherry Tomatoes', category: 'produce', quantity: '1 cup', expiringSoon: true },
  { id: '5', name: 'Garlic', category: 'produce', quantity: '4 cloves', expiringSoon: false },
  { id: '6', name: 'Leftover White Rice', category: 'grains', quantity: '2 cups', expiringSoon: true },
  { id: '7', name: 'Olive Oil', category: 'sauces', quantity: 'Bottle', expiringSoon: false },
  { id: '8', name: 'Soy Sauce', category: 'sauces', quantity: 'Bottle', expiringSoon: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'planner' | 'saved'>('recipes');
  const [ingredients, setIngredients] = useState<IngredientItem[]>(() => {
    try {
      const saved = localStorage.getItem('pantryiq_ingredients');
      return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
    } catch {
      return INITIAL_INGREDIENTS;
    }
  });

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('pantryiq_saved_recipes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [preferences, setPreferences] = useState<FilterPreferences>({
    mealType: 'any',
    maxCookTimeMinutes: 30,
    dietary: [],
    skillLevel: 'intermediate',
    appliances: ['Stovetop'],
    strictness: 'staples',
    servings: 2,
  });

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipeSource, setRecipeSource] = useState<'gemini' | 'fallback'>('gemini');
  const [notification, setNotification] = useState<string | null>(null);

  // Sync ingredients to localStorage
  useEffect(() => {
    localStorage.setItem('pantryiq_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  // Sync saved recipes to localStorage
  useEffect(() => {
    localStorage.setItem('pantryiq_saved_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  // Auto-generate recipes on mount or when preset is loaded
  useEffect(() => {
    if (ingredients.length > 0 && recipes.length === 0) {
      handleGenerateRecipes();
    }
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    try {
      const result = await fetchRecipeRecommendations(ingredients, preferences);
      setRecipes(result.recipes);
      setRecipeSource(result.source);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = (item: Omit<IngredientItem, 'id'>) => {
    const newItem: IngredientItem = {
      ...item,
      id: 'ing_' + Date.now() + Math.random().toString(36).substring(2, 5),
    };
    setIngredients((prev) => [newItem, ...prev]);
    showToast(`Added ${item.name} to kitchen!`);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleExpiring = (id: string) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, expiringSoon: !i.expiringSoon } : i))
    );
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_PANTRIES.find((p) => p.id === presetId);
    if (!preset) return;

    const formatted: IngredientItem[] = preset.items.map((item, idx) => ({
      ...item,
      id: `preset_${preset.id}_${idx}_${Date.now()}`,
    }));
    setIngredients(formatted);
    showToast(`Loaded ${preset.name}!`);

    // Trigger fresh recommendations with the newly loaded ingredients
    setTimeout(() => {
      handleGenerateRecipes();
    }, 100);
  };

  const handleClearAll = () => {
    setIngredients([]);
    setRecipes([]);
    showToast('Pantry cleared');
  };

  const handleAddDetectedItems = (detected: Array<Omit<IngredientItem, 'id'>>) => {
    const newItems: IngredientItem[] = detected.map((item, idx) => ({
      ...item,
      id: `scanned_${Date.now()}_${idx}`,
    }));
    setIngredients((prev) => [...newItems, ...prev]);
    showToast(`Added ${newItems.length} scanned ingredients!`);
    setTimeout(() => {
      handleGenerateRecipes();
    }, 150);
  };

  const handleToggleSave = (recipe: Recipe) => {
    const isSaved = savedRecipes.some((r) => r.id === recipe.id);
    if (isSaved) {
      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      showToast('Removed from saved recipes');
    } else {
      setSavedRecipes((prev) => [recipe, ...prev]);
      showToast('Saved to your cookbook!');
    }
  };

  const expiringCount = ingredients.filter((i) => i.expiringSoon).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pantryCount={ingredients.length}
        expiringCount={expiringCount}
        savedCount={savedRecipes.length}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'recipes' && (
          <div>
            {/* Hero Banner / Problem Statement */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
              <div className="absolute right-0 -bottom-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI-Powered Recipe & Meal Recommender</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
                  Stop Asking "What's For Dinner?"
                </h1>
                <p className="text-slate-200 text-xs sm:text-sm mt-2 leading-relaxed max-w-xl">
                  Tell our AI what ingredients you have in your fridge or pantry right now. We'll generate chef-crafted recipes tailored to what you own, prioritizing food that is about to spoil so nothing goes to waste.
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4 pt-2 text-xs font-medium text-emerald-100">
                  <div className="flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span>Zero Food Waste Priority</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-emerald-400" />
                    <span>Interactive Cooking & Timers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Instant Substitutions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pantry Ingredient Manager */}
            <PantryManager
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              onToggleExpiring={handleToggleExpiring}
              onLoadPreset={handleLoadPreset}
              onClearAll={handleClearAll}
              onOpenScanner={() => setIsScannerOpen(true)}
            />

            {/* Culinary Filters & Generate Bar */}
            <FilterControls
              preferences={preferences}
              onChange={setPreferences}
              onGenerate={handleGenerateRecipes}
              isLoading={isLoading}
              ingredientsCount={ingredients.length}
            />

            {/* Recommended Recipes Grid */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    Recommended For Your Pantry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hand-crafted recipes using your ingredients • Ordered by match percentage
                  </p>
                </div>

                {recipes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleGenerateRecipes}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 disabled:opacity-40 self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Regenerate Ideas</span>
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
                  <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-slate-800">
                    Designing Chef-Crafted Recipes...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Gemini AI is analyzing your {ingredients.length} ingredients, calculating nutritional macros, and formulating step-by-step instructions.
                  </p>
                </div>
              ) : recipes.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
                  <div className="text-4xl">🍳</div>
                  <h4 className="font-serif text-base font-bold text-slate-800">
                    No recipes generated yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Select a preset pantry or add 2 or 3 ingredients above and click "Generate Recipes Now" to see customized culinary ideas!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onSelect={(r) => setSelectedRecipe(r)}
                      isSaved={savedRecipes.some((sr) => sr.id === recipe.id)}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Meal Planner Tab */}
        {activeTab === 'planner' && (
          <MealPlannerView
            ingredients={ingredients}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
          />
        )}

        {/* Saved Cookbook Tab */}
        {activeTab === 'saved' && (
          <SavedRecipesView
            savedRecipes={savedRecipes}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onToggleSave={handleToggleSave}
            onExploreRecipes={() => setActiveTab('recipes')}
          />
        )}
      </main>

      {/* Recipe Detail Modal / Cooking Mode */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isSaved={savedRecipes.some((sr) => sr.id === selectedRecipe.id)}
          onToggleSave={handleToggleSave}
        />
      )}

      {/* Multimodal Fridge Scanner Modal */}
      <FridgeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddDetectedItems={handleAddDetectedItems}
      />

      {/* Subtle Culinary Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">PantryIQ</span>
            <span>— Intelligent Zero-Waste Food Recommendation AI</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini AI</span>
            <span>•</span>
            <span>Save Food. Save Money. Eat Well.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
