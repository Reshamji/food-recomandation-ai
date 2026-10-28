import React from 'react';
import {
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  ChefHat,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  isSaved: boolean;
  onToggleSave: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  isSaved,
  onToggleSave,
}) => {
  const pantryIngredientsCount = recipe.ingredients.filter((i) => i.fromPantry).length;
  const totalIngredientsCount = recipe.ingredients.length;
  const isCompleteMatch = recipe.missingIngredients.length === 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner / Match Score & Save */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Match Score Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                recipe.matchPercentage >= 90
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : recipe.matchPercentage >= 75
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{recipe.matchPercentage}% Match</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {pantryIngredientsCount}/{totalIngredientsCount} items ready
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(recipe);
            }}
            title={isSaved ? 'Remove from saved' : 'Save recipe to cookbook'}
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Title and Tagline */}
        <h3
          onClick={() => onSelect(recipe)}
          className="font-serif text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
        >
          {recipe.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {recipe.tagline}
        </p>

        {/* Meta badges: time, calories, protein, difficulty */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{recipe.totalTimeMinutes}m total</span>
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
            🔥 {recipe.calories} kcal
          </span>
          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">
            💪 {recipe.proteinGrams}g Protein
          </span>
          <span className="bg-slate-100 px-2 py-1 rounded-lg text-[11px] uppercase tracking-wide">
            {recipe.difficulty}
          </span>
        </div>

        {/* Highlights Pills */}
        {recipe.highlights && recipe.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {recipe.highlights.slice(0, 3).map((hl, i) => (
              <span
                key={i}
                className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/60"
              >
                {hl}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients preview & Missing Notice */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50/70 border-t border-b border-slate-100 text-xs">
        {isCompleteMatch ? (
          <div className="flex items-center gap-2 text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% ready to cook with your pantry!</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span>Missing: </span>
              <span className="font-bold">
                {recipe.missingIngredients.map((m) => m.name).join(', ')}
              </span>
              {recipe.missingIngredients[0]?.commonSubstitute && (
                <span className="text-[11px] text-amber-700 block">
                  💡 Easy sub: {recipe.missingIngredients[0].commonSubstitute}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-5 sm:p-6 pt-3 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 font-medium">
          {recipe.instructions.length} step-by-step instructions
        </div>

        <button
          type="button"
          onClick={() => onSelect(recipe)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs group-hover:shadow active:scale-95"
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Cook Recipe</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
