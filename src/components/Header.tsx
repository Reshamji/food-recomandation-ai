import React from 'react';
import { ChefHat, Sparkles, CalendarDays, Bookmark, Camera, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'recipes' | 'planner' | 'saved';
  setActiveTab: (tab: 'recipes' | 'planner' | 'saved') => void;
  pantryCount: number;
  expiringCount: number;
  savedCount: number;
  onOpenScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pantryCount,
  expiringCount,
  savedCount,
  onOpenScanner,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('recipes')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                  Pantry<span className="text-emerald-600">IQ</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AI Chef
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Turn your available ingredients into delicious zero-waste meals
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'recipes'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Recipes</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                activeTab === 'recipes' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {pantryCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'planner'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Meal Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden md:inline">Cookbook</span>
              {savedCount > 0 && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                  activeTab === 'saved' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-700 font-bold'
                }`}>
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Action: Photo Scanner */}
          <div className="flex items-center gap-2">
            {expiringCount > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{expiringCount} items expiring soon</span>
              </div>
            )}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Scan Fridge</span>
              <span className="sm:hidden">Scan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
