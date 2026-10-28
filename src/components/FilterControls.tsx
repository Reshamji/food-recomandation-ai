import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Utensils,
  Flame,
  ChefHat,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { FilterPreferences, StrictnessLevel } from '../types/recipe';

interface FilterControlsProps {
  preferences: FilterPreferences;
  onChange: (updated: FilterPreferences) => void;
  onGenerate: () => void;
  isLoading: boolean;
  ingredientsCount: number;
}

const DIETARY_OPTIONS = [
  'High Protein',
  'Vegetarian',
  'Vegan',
  'Keto / Low Carb',
  'Gluten-Free',
  'Dairy-Free',
  'Low Calorie',
];

const APPLIANCE_OPTIONS = [
  'Stovetop',
  'Oven',
  'Air Fryer',
  'Microwave',
  'Instant Pot',
  'Blender',
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  preferences,
  onChange,
  onGenerate,
  isLoading,
  ingredientsCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const setMealType = (type: FilterPreferences['mealType']) => {
    onChange({ ...preferences, mealType: type });
  };

  const setCookTime = (mins: number) => {
    onChange({ ...preferences, maxCookTimeMinutes: mins });
  };

  const toggleDietary = (item: string) => {
    const next = preferences.dietary.includes(item)
      ? preferences.dietary.filter((d) => d !== item)
      : [...preferences.dietary, item];
    onChange({ ...preferences, dietary: next });
  };

  const toggleAppliance = (app: string) => {
    const next = preferences.appliances.includes(app)
      ? preferences.appliances.filter((a) => a !== app)
      : [...preferences.appliances, app];
    onChange({ ...preferences, appliances: next });
  };

  const setStrictness = (strictness: StrictnessLevel) => {
    onChange({ ...preferences, strictness });
  };

  const changeServings = (delta: number) => {
    const next = Math.max(1, Math.min(10, preferences.servings + delta));
    onChange({ ...preferences, servings: next });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 mb-8">
      {/* Top row: Meal Type & Cook Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meal Type */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 block">
            Meal Idea:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'any', label: 'Any Meal' },
              { id: 'dinner', label: 'Dinner' },
              { id: 'lunch', label: 'Lunch' },
              { id: 'breakfast', label: 'Breakfast' },
              { id: 'snack', label: 'Quick Snack' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMealType(option.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  preferences.mealType === option.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cook Time Limits */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
            <span>Cooking Time Limit:</span>
            <span className="text-emerald-700 font-bold lowercase">
              {preferences.maxCookTimeMinutes === 0 ? 'Any duration' : `Under ${preferences.maxCookTimeMinutes} mins`}
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { mins: 15, label: '⚡ 15m Express' },
              { mins: 30, label: '⏱️ 30m Standard' },
              { mins: 45, label: '🥘 45m Leisure' },
              { mins: 0, label: 'Any Time' },
            ].map((item) => (
              <button
                key={item.mins}
                type="button"
                onClick={() => setCookTime(item.mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  preferences.maxCookTimeMinutes === item.mins
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Strictness Mode Selector */}
      <div className="mt-5 pt-5 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
          Pantry Matching Strictness:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              id: 'strict',
              title: 'Strict Pantry Only',
              desc: 'Use exclusively what is in your list, zero missing items',
            },
            {
              id: 'staples',
              title: 'Include Common Staples',
              desc: 'Allow salt, pepper, cooking oil, and tap water',
            },
            {
              id: 'flexible',
              title: 'Flexible (+1 Grocery)',
              desc: 'Allow 1-2 missing ingredients with substitutes',
            },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setStrictness(mode.id as StrictnessLevel)}
              className={`p-3 text-left rounded-2xl border transition-all ${
                preferences.strictness === mode.id
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-500/30'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">{mode.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Advanced Filters */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dietary Diets, Appliances & Servings</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Dietary */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Dietary Goals:
              </span>
              <div className="flex flex-wrap gap-1">
                {DIETARY_OPTIONS.map((diet) => {
                  const active = preferences.dietary.includes(diet);
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => toggleDietary(diet)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Appliances */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Kitchen Equipment:
              </span>
              <div className="flex flex-wrap gap-1">
                {APPLIANCE_OPTIONS.map((app) => {
                  const active = preferences.appliances.includes(app);
                  return (
                    <button
                      key={app}
                      type="button"
                      onClick={() => toggleAppliance(app)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {app}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Servings */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Portion Servings:
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 bg-white rounded-xl shadow-2xs">
                  <button
                    type="button"
                    onClick={() => changeServings(-1)}
                    className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-bold text-slate-900">{preferences.servings}</span>
                  <button
                    type="button"
                    onClick={() => changeServings(1)}
                    className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-r-xl"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  {preferences.servings === 1 ? 'Solo plate' : `${preferences.servings} people`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-800">
            {ingredientsCount} {ingredientsCount === 1 ? 'ingredient' : 'ingredients'} ready
          </span>{' '}
          • Ready to calculate culinary flavor pairings
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || ingredientsCount === 0}
          className={`flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-sm transition-all shadow-md active:scale-98 ${
            isLoading || ingredientsCount === 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-600/30 hover:shadow-lg hover:shadow-emerald-600/40'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Crafting Gourmet Recipes with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Generate Recipes Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
