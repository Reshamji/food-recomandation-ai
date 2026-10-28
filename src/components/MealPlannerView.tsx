import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  ShoppingCart,
  Copy,
  Check,
  RefreshCw,
  Utensils,
  Leaf,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { MealPlan, IngredientItem, Recipe } from '../types/recipe';
import { generateWeeklyMealPlan } from '../services/api';

interface MealPlannerViewProps {
  ingredients: IngredientItem[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  ingredients,
  onSelectRecipe,
}) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [daysCount, setDaysCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedGrocery, setCopiedGrocery] = useState(false);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const plan = await generateWeeklyMealPlan(ingredients, daysCount);
      setMealPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyGroceryList = () => {
    if (!mealPlan) return;
    const text = mealPlan.groceryList
      .map((g) => `- ${g.item} (${g.neededFor})`)
      .join('\n');
    navigator.clipboard.writeText(
      `PantryIQ Zero-Waste Grocery List:\n${text}\n\nGenerated with AI based on your available ingredients.`
    );
    setCopiedGrocery(true);
    setTimeout(() => setCopiedGrocery(false), 2000);
  };

  const toggleGroceryItem = (item: string) => {
    setCheckedGroceryItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
            <Leaf className="w-3.5 h-3.5" />
            <span>Zero-Waste Algorithm</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            AI Zero-Waste Meal Planner
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Our AI schedules meals where perishable ingredients carry over logically across days (e.g. roast vegetables for dinner on Day 1, and fold leftovers into a savory frittata for Day 2).
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex items-center bg-white/10 backdrop-blur-xs rounded-xl p-1 border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDaysCount(3)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  daysCount === 3 ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                3-Day Plan
              </button>
              <button
                type="button"
                onClick={() => setDaysCount(5)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  daysCount === 5 ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                5-Day Plan
              </button>
            </div>

            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isLoading || ingredients.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Sequencing Meals...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{mealPlan ? 'Regenerate Plan' : 'Generate Meal Plan'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Display */}
      {mealPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Days Schedule */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {mealPlan.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>{mealPlan.zeroWasteScore}% Waste Elimination</span>
              </div>
            </div>

            {mealPlan.days.map((day) => (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4"
              >
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      D{day.dayNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{day.dayName}</h4>
                  </div>
                  <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
                    🌱 {day.wasteReductionFocus}
                  </div>
                </div>

                {/* Meals Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Breakfast */}
                  <div
                    onClick={() => onSelectRecipe(day.breakfast)}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer transition-all group"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Breakfast
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-1">
                      {day.breakfast.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {day.breakfast.tagline}
                    </div>
                  </div>

                  {/* Lunch */}
                  <div
                    onClick={() => onSelectRecipe(day.lunch)}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer transition-all group"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Lunch
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-1">
                      {day.lunch.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {day.lunch.tagline}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div
                    onClick={() => onSelectRecipe(day.dinner)}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer transition-all group"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Dinner
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-1">
                      {day.dinner.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {day.dinner.tagline}
                    </div>
                  </div>
                </div>

                {/* Snack */}
                {day.snack && (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                    <span className="font-semibold text-slate-700">Healthy Snack Idea:</span>
                    <span>{day.snack}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Minimal Grocery Checklist */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-base">Mini Grocery List</h4>
                </div>
                <button
                  type="button"
                  onClick={copyGroceryList}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  {copiedGrocery ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGrocery ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Only {mealPlan.groceryList.length} items needed to cook all {mealPlan.days.length * 3} meals! Everything else comes from your pantry.
              </p>

              <div className="space-y-2">
                {mealPlan.groceryList.map((item, idx) => {
                  const isChecked = !!checkedGroceryItems[item.item];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleGroceryItem(item.item)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-slate-50 text-slate-400 line-through border-slate-200'
                          : 'bg-white hover:bg-emerald-50/30 text-slate-800 border-slate-200/80'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-bold">{item.item}</div>
                        <div className="text-[10px] text-slate-500">{item.neededFor}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Call to Action */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl shadow-inner">
            📅
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-900">
            No Active Meal Plan Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Ready to plan out your week and eliminate spoiled groceries? Click the button above to generate a custom multi-day meal schedule based on your pantry.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGeneratePlan}
              disabled={isLoading || ingredients.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20"
            >
              Generate 3-Day Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
