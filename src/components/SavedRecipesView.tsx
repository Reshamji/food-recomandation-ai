import React, { useState } from 'react';
import { Bookmark, Search, Clock, Trash2, ChefHat, Sparkles } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from './RecipeCard';

interface SavedRecipesViewProps {
  savedRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleSave: (recipe: Recipe) => void;
  onExploreRecipes: () => void;
}

export const SavedRecipesView: React.FC<SavedRecipesViewProps> = ({
  savedRecipes,
  onSelectRecipe,
  onToggleSave,
  onExploreRecipes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = savedRecipes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tagline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Your Saved Cookbook</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {savedRecipes.length} recipes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personal collection of dishes you loved and want to cook again.
          </p>
        </div>

        {savedRecipes.length > 0 && (
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved recipes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Grid or Empty */}
      {savedRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            📖
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900">Your Cookbook is Empty</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Whenever you find a recipe you love, click the bookmark icon to save it here for fast kitchen access anytime.
          </p>
          <div className="pt-2">
            <button
              onClick={onExploreRecipes}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              Explore Recipes Now
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          No saved recipes matched "{searchTerm}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={onSelectRecipe}
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};
