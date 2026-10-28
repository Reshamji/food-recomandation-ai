import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Bookmark,
  Share2,
  Printer,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Send,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe } from '../types/recipe';
import { askSousChef } from '../services/api';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  if (!recipe) return null;

  const [cookingMode, setCookingMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Kitchen Timer State
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerOriginalSeconds, setTimerOriginalSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<any>(null);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sous-Chef Chat Drawer
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'chef'; text: string }>>([
    {
      sender: 'chef',
      text: `Hello chef! I'm your AI kitchen assistant for "${recipe.title}". Need a substitution, heat advice, or plating tip? Ask me anytime!`,
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAskingChef, setIsAskingChef] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Step change sync
  useEffect(() => {
    // Stop any speech when step changes
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Set timer if current step has one
    const currentStep = recipe.instructions[activeStepIndex];
    if (currentStep && currentStep.timerMinutes) {
      const secs = currentStep.timerMinutes * 60;
      setTimerOriginalSeconds(secs);
      setTimerSecondsLeft(secs);
      setTimerRunning(false);
    } else {
      setTimerSecondsLeft(null);
      setTimerRunning(false);
    }
  }, [activeStepIndex, recipe]);

  // Timer Tick
  useEffect(() => {
    if (timerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            playTimerAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning, timerSecondsLeft]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const playTimerAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio alert fallback');
    }
  };

  const toggleIngredientCheck = (name: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSpeakStep = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentStep = recipe.instructions[activeStepIndex];
    const textToRead = `Step ${currentStep.stepNumber}. ${currentStep.instruction}. ${
      currentStep.chefTip ? `Chef tip: ${currentStep.chefTip}` : ''
    }`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNextStep = () => {
    if (activeStepIndex < recipe.instructions.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
      setIsCompleted(false);
    }
  };

  const handleAskSousChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isAskingChef) return;

    const question = inputQuestion.trim();
    setInputQuestion('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setIsAskingChef(true);

    const answer = await askSousChef(
      recipe.title,
      recipe.ingredients.map((i) => i.name),
      cookingMode ? recipe.instructions[activeStepIndex]?.stepNumber : undefined,
      question
    );

    setChatMessages((prev) => [...prev, { sender: 'chef', text: answer }]);
    setIsAskingChef(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentStep = recipe.instructions[activeStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (cookingMode) setCookingMode(false);
                else onClose();
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
            >
              {cookingMode ? <ArrowLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {recipe.cuisine}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {recipe.totalTimeMinutes} mins • {recipe.servings} servings
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 line-clamp-1">
                {recipe.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(recipe)}
              className={`p-2.5 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
              }`}
              title="Bookmark Recipe"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors hidden sm:block"
              title="Print Recipe"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Cooking Mode Switcher */}
            <button
              type="button"
              onClick={() => setCookingMode(!cookingMode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                cookingMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>{cookingMode ? 'Exit Cooking Mode' : 'Start Cooking Mode'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {cookingMode ? (
            /* STEP-BY-STEP COOKING MODE */
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Progress Steps Header */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  Step {activeStepIndex + 1} of {recipe.instructions.length}
                </span>
                <span className="text-emerald-700">
                  {Math.round(((activeStepIndex + 1) / recipe.instructions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{
                    width: `${((activeStepIndex + 1) / recipe.instructions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Step Card */}
              {isCompleted ? (
                <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="text-5xl">🎉</div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Bon Appétit!</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    You've successfully finished cooking <strong>{recipe.title}</strong> using your pantry ingredients. Zero food wasted!
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsCompleted(false);
                        setActiveStepIndex(0);
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Start Over
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                    >
                      Back to Recipes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-6">
                  {/* Step audio voice button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      Step {currentStep.stepNumber}
                    </span>

                    {'speechSynthesis' in window && (
                      <button
                        type="button"
                        onClick={handleSpeakStep}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSpeaking
                            ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Listen to instruction hands-free"
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
                      </button>
                    )}
                  </div>

                  {/* Step Text */}
                  <p className="text-base sm:text-xl font-medium text-slate-800 leading-relaxed">
                    {currentStep.instruction}
                  </p>

                  {/* Chef Tip */}
                  {currentStep.chefTip && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-amber-900">
                        <span className="font-bold">Chef's Technique: </span>
                        {currentStep.chefTip}
                      </div>
                    </div>
                  )}

                  {/* Interactive Kitchen Timer (if step has timer) */}
                  {timerSecondsLeft !== null && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold ${
                            timerRunning
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : timerSecondsLeft === 0
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {formatTimer(timerSecondsLeft)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {timerSecondsLeft === 0 ? '⏰ Time is Up!' : 'Kitchen Step Timer'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {currentStep.timerMinutes} minutes suggested
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTimerRunning(!timerRunning)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                            timerRunning
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{timerRunning ? 'Pause' : 'Start Timer'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTimerRunning(false);
                            setTimerSecondsLeft(timerOriginalSeconds);
                          }}
                          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"
                          title="Reset Timer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={activeStepIndex === 0}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Step</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <span>
                        {activeStepIndex === recipe.instructions.length - 1 ? 'Finish Dish' : 'Next Step'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* OVERVIEW MODE */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Ingredients Checklist & Nutrition */}
              <div className="md:col-span-1 space-y-5">
                {/* Ingredients Prep Checklist */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ingredients Prep
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {Object.values(checkedIngredients).filter(Boolean).length}/{recipe.ingredients.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {recipe.ingredients.map((ing, i) => {
                      const isChecked = !!checkedIngredients[ing.name];
                      return (
                        <div
                          key={i}
                          onClick={() => toggleIngredientCheck(ing.name)}
                          className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                            isChecked
                              ? 'bg-emerald-50/70 text-slate-400 line-through'
                              : 'bg-white hover:bg-emerald-50/40 text-slate-800'
                          } border border-slate-200/60`}
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
                          <div className="flex-1">
                            <span className="font-semibold">{ing.name}</span>
                            <span className="text-slate-500 ml-1.5 font-normal">({ing.amount})</span>
                            {ing.commonSubstitute && (
                              <span className="block text-[10px] text-amber-700 no-underline font-normal">
                                Sub: {ing.commonSubstitute}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nutrition Breakdown */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Nutrition / Serving
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-base font-bold text-slate-900">{recipe.calories}</div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Calories</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="text-base font-bold text-emerald-800">{recipe.proteinGrams}g</div>
                      <div className="text-[10px] font-semibold text-emerald-700 uppercase">Protein</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-base font-bold text-slate-900">{recipe.carbsGrams}g</div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Carbs</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-base font-bold text-slate-900">{recipe.fatGrams}g</div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Fats</div>
                    </div>
                  </div>
                </div>

                {/* Flavor Profile Radar */}
                {recipe.flavorProfile && (
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Flavor Balance
                    </h4>
                    <div className="space-y-2 text-xs">
                      {Object.entries(recipe.flavorProfile).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600 capitalize mb-0.5">
                            <span>{key}</span>
                            <span>{val}/10</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${(val / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Instructions, Chef Notes, Zero-Waste Tip */}
              <div className="md:col-span-2 space-y-5">
                {/* Chef Notes & Waste Tip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Zero-Waste Tip</span>
                    </div>
                    <p className="leading-relaxed">{recipe.wasteReductionTip}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-800">
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Executive Chef's Note</span>
                    </div>
                    <p className="leading-relaxed">{recipe.chefNotes}</p>
                  </div>
                </div>

                {/* Full Instructions List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Step-by-Step Directions
                  </h4>
                  {recipe.instructions.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 transition-colors flex items-start gap-3.5 shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                          {step.instruction}
                        </p>
                        {step.chefTip && (
                          <div className="text-xs text-amber-800 font-medium mt-1.5 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Pro Tip: {step.chefTip}</span>
                          </div>
                        )}
                        {step.timerMinutes && (
                          <div className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Suggested timer: {step.timerMinutes} mins</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Sous-Chef Chat Drawer */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Ask Live AI Sous-Chef
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-semibold">
                  Kitchen Assistant
                </span>
              </div>

              {/* Chat messages */}
              <div
                ref={chatScrollRef}
                className="max-h-40 overflow-y-auto space-y-2 mb-3 pr-2 scrollbar-none text-xs"
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAskingChef && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-2xl text-xs text-slate-500 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                      <span>Chef is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <form onSubmit={handleAskSousChef} className="flex gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="E.g., Can I use butter instead of oil? How do I make it spicier?"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || isAskingChef}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
