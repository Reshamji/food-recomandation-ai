import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Flame,
  Check,
  Search,
  RefreshCw,
  FolderPlus,
  AlertTriangle,
} from 'lucide-react';
import { IngredientItem } from '../types/recipe';
import { PRESET_PANTRIES, CATEGORY_LABELS, POPULAR_INGREDIENTS } from '../data/commonIngredients';

interface PantryManagerProps {
  ingredients: IngredientItem[];
  onAddIngredient: (item: Omit<IngredientItem, 'id'>) => void;
  onRemoveIngredient: (id: string) => void;
  onToggleExpiring: (id: string) => void;
  onLoadPreset: (presetId: string) => void;
  onClearAll: () => void;
  onOpenScanner: () => void;
}

export const PantryManager: React.FC<PantryManagerProps> = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onToggleExpiring,
  onLoadPreset,
  onClearAll,
  onOpenScanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientItem['category'] | 'all'>('all');
  const [customQuantity, setCustomQuantity] = useState('');
  const [isExpiringNew, setIsExpiringNew] = useState(false);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);

  // Autocomplete matching
  const matchingSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    const existing = new Set(ingredients.map((i) => i.name.toLowerCase()));
    return POPULAR_INGREDIENTS.filter(
      (item) => item.name.toLowerCase().includes(term) && !existing.has(item.name.toLowerCase())
    ).slice(0, 6);
  }, [searchTerm, ingredients]);

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    // Detect likely category
    const found = POPULAR_INGREDIENTS.find(
      (p) => p.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    const category = found ? found.category : selectedCategory === 'all' ? 'produce' : selectedCategory;

    onAddIngredient({
      name: searchTerm.trim(),
      category,
      quantity: customQuantity.trim() || undefined,
      expiringSoon: isExpiringNew,
    });

    setSearchTerm('');
    setCustomQuantity('');
    setIsExpiringNew(false);
  };

  const filteredIngredients = useMemo(() => {
    if (selectedCategory === 'all') return ingredients;
    return ingredients.filter((i) => i.category === selectedCategory);
  }, [ingredients, selectedCategory]);

  const expiringCount = ingredients.filter((i) => i.expiringSoon).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 mb-8">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Kitchen & Pantry</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {ingredients.length} items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add what you have in your fridge, cabinets, or spice rack. Our AI prioritizes ingredients that are expiring soon!
          </p>
        </div>

        {/* Action presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Load Preset Pantry</span>
            </button>

            {showPresetsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30">
                <div className="text-xs font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Select a starter kitchen
                </div>
                {PRESET_PANTRIES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onLoadPreset(preset.id);
                      setShowPresetsDropdown(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-emerald-50 rounded-xl transition-colors flex items-start gap-2.5 group"
                  >
                    <span className="text-xl p-1 bg-slate-100 group-hover:bg-emerald-100 rounded-lg">
                      {preset.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/80 px-1.5 rounded-full">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{preset.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {ingredients.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Preset Fast Chips */}
      <div className="pt-4 pb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Quick-Load Sample Pantries:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PRESET_PANTRIES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-medium text-slate-700 hover:text-emerald-900 whitespace-nowrap transition-all shadow-2xs hover:shadow-xs group"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <form onSubmit={handleAddSubmit} className="mt-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Main search / item name input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type an ingredient (e.g. Avocado, Chicken, Soy Sauce, Leftover Rice...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />

            {/* Autocomplete suggestions dropdown */}
            {matchingSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-20">
                <div className="text-[11px] font-semibold text-slate-400 px-3 py-1">Quick Add:</div>
                <div className="grid grid-cols-2 gap-1">
                  {matchingSuggestions.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        onAddIngredient({
                          name: item.name,
                          category: item.category,
                          expiringSoon: isExpiringNew,
                        });
                        setSearchTerm('');
                        setIsExpiringNew(false);
                      }}
                      className="text-left px-3 py-2 rounded-xl hover:bg-emerald-50 flex items-center justify-between text-xs text-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>{CATEGORY_LABELS[item.category].icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional quantity input */}
          <input
            type="text"
            value={customQuantity}
            onChange={(e) => setCustomQuantity(e.target.value)}
            placeholder="Qty (e.g. 2 cups, 1 can)"
            className="sm:w-36 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />

          {/* Expiring soon checkbox toggle */}
          <button
            type="button"
            onClick={() => setIsExpiringNew(!isExpiringNew)}
            title="Mark if this food is close to expiring so recipes prioritize it"
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border text-xs font-semibold transition-all whitespace-nowrap ${
              isExpiringNew
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className={`w-4 h-4 ${isExpiringNew ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
            <span>Use First</span>
          </button>

          {/* Add Button */}
          <button
            type="submit"
            disabled={!searchTerm.trim()}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none mt-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({ingredients.length})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => {
          const count = ingredients.filter((i) => i.category === catKey).length;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey as IngredientItem['category'])}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === catKey
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{info.icon}</span>
              <span>{info.label.split('&')[0].trim()}</span>
              {count > 0 && <span className="opacity-75 font-semibold">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Current Ingredients List (Chips Grid) */}
      <div className="mt-3">
        {filteredIngredients.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center">
            <div className="text-3xl mb-2">🥗</div>
            <h4 className="text-sm font-bold text-slate-800">Your pantry is empty</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add a few ingredients above, load one of our quick presets, or scan your fridge with AI to get instant personalized meal ideas!
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => onLoadPreset('clean_fridge')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Load Sample Kitchen
              </button>
              <button
                onClick={onOpenScanner}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Scan Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredIngredients.map((item) => {
              const catInfo = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;
              return (
                <div
                  key={item.id}
                  className={`group relative flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-2xl border transition-all ${
                    item.expiringSoon
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-2xs'
                      : 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <span className="text-sm select-none">{catInfo.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">{item.name}</span>
                    {item.quantity && (
                      <span className="text-[10px] text-slate-500 leading-tight">{item.quantity}</span>
                    )}
                  </div>

                  {/* Toggle Expiring Soon Button */}
                  <button
                    type="button"
                    onClick={() => onToggleExpiring(item.id)}
                    title={item.expiringSoon ? 'Marked as expiring soon' : 'Click to prioritize (expiring soon)'}
                    className={`p-1 rounded-lg transition-colors ${
                      item.expiringSoon
                        ? 'text-amber-600 bg-amber-100/80 hover:bg-amber-200'
                        : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${item.expiringSoon ? 'fill-amber-500' : ''}`} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveIngredient(item.id)}
                    title="Remove item"
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info / Zero-Waste Notice */}
      {expiringCount > 0 && (
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-300/50 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span className="font-semibold">
              {expiringCount} {expiringCount === 1 ? 'item' : 'items'} flagged to use first!
            </span>
            <span className="hidden sm:inline text-amber-700">
              The AI recipe generator will design meals around them to prevent waste.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
