import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// -------------------------------------------------------------
// Endpoint 1: POST /api/recommend-recipes
// -------------------------------------------------------------
app.post('/api/recommend-recipes', async (req, res) => {
  const {
    ingredients = [],
    staples = [],
    dietary = [],
    mealType = 'any',
    maxCookTimeMinutes = 0,
    skillLevel = 'intermediate',
    appliances = [],
    strictness = 'staples',
    servings = 2,
  } = req.body;

  const ingredientListStr = ingredients
    .map((i: any) => `${i.name} (${i.quantity || 'available'}${i.expiringSoon ? ' - EXPIRING SOON' : ''})`)
    .join(', ');

  const prompt = `You are a Michelin-star zero-waste executive chef.
The user wants custom recipe recommendations to cook right now using what they have in their kitchen.

User's Available Ingredients:
${ingredientListStr || 'Pantry staples (eggs, rice, garlic, onions, oil)'}

Pantry Staples Allowed:
${staples.join(', ') || 'Cooking oil, salt, black pepper, water'}

Preferences:
- Meal Type: ${mealType}
- Maximum Cooking Time: ${maxCookTimeMinutes > 0 ? `${maxCookTimeMinutes} minutes` : 'Any time'}
- Dietary Needs: ${dietary.length > 0 ? dietary.join(', ') : 'None specified'}
- Cooking Skill Level: ${skillLevel}
- Appliances Available: ${appliances.length > 0 ? appliances.join(', ') : 'Standard stovetop/oven'}
- Strictness: ${strictness} (strict = use ONLY listed items; staples = allow oil/salt/pepper/water; flexible = can suggest 1-2 easy missing pantry ingredients)
- Target Servings: ${servings}

Please recommend 3 to 4 distinct, appetizing, realistic recipes that maximize the use of the user's available ingredients, specifically prioritizing items marked "EXPIRING SOON" to reduce food waste.

Return ONLY a JSON object that strictly adheres to the requested schema.`;

  if (!ai || !process.env.GEMINI_API_KEY) {
    console.log('Gemini API key not found; returning signal for fallback generator');
    return res.status(200).json({
      success: true,
      source: 'fallback',
      recipes: [],
      message: 'Using smart local culinary engine',
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  matchPercentage: { type: Type.INTEGER },
                  prepTimeMinutes: { type: Type.INTEGER },
                  cookTimeMinutes: { type: Type.INTEGER },
                  totalTimeMinutes: { type: Type.INTEGER },
                  servings: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING },
                  calories: { type: Type.INTEGER },
                  proteinGrams: { type: Type.INTEGER },
                  carbsGrams: { type: Type.INTEGER },
                  fatGrams: { type: Type.INTEGER },
                  fiberGrams: { type: Type.INTEGER },
                  highlights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  flavorProfile: {
                    type: Type.OBJECT,
                    properties: {
                      savory: { type: Type.INTEGER },
                      sweet: { type: Type.INTEGER },
                      spicy: { type: Type.INTEGER },
                      umami: { type: Type.INTEGER },
                      tangy: { type: Type.INTEGER },
                    },
                    required: ['savory', 'sweet', 'spicy', 'umami', 'tangy'],
                  },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING },
                        fromPantry: { type: Type.BOOLEAN },
                        commonSubstitute: { type: Type.STRING },
                        optional: { type: Type.BOOLEAN },
                      },
                      required: ['name', 'amount', 'fromPantry'],
                    },
                  },
                  missingIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING },
                        commonSubstitute: { type: Type.STRING },
                      },
                      required: ['name', 'amount'],
                    },
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        stepNumber: { type: Type.INTEGER },
                        instruction: { type: Type.STRING },
                        timerMinutes: { type: Type.INTEGER },
                        chefTip: { type: Type.STRING },
                      },
                      required: ['stepNumber', 'instruction'],
                    },
                  },
                  chefNotes: { type: Type.STRING },
                  wasteReductionTip: { type: Type.STRING },
                },
                required: [
                  'id',
                  'title',
                  'tagline',
                  'cuisine',
                  'matchPercentage',
                  'prepTimeMinutes',
                  'cookTimeMinutes',
                  'totalTimeMinutes',
                  'servings',
                  'difficulty',
                  'calories',
                  'proteinGrams',
                  'carbsGrams',
                  'fatGrams',
                  'ingredients',
                  'instructions',
                  'chefNotes',
                  'wasteReductionTip',
                ],
              },
            },
          },
          required: ['recipes'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.status(200).json({
      success: true,
      source: 'gemini',
      recipes: parsed.recipes || [],
    });
  } catch (error: any) {
    console.error('Error generating recipes with Gemini:', error);
    return res.status(200).json({
      success: true,
      source: 'fallback',
      recipes: [],
      error: error.message || 'Gemini error, fallback activated',
    });
  }
});

// -------------------------------------------------------------
// Endpoint 2: POST /api/parse-pantry-image
// -------------------------------------------------------------
app.post('/api/parse-pantry-image', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }

  if (!ai || !process.env.GEMINI_API_KEY) {
    // Provide sample detected items for demo if no key
    return res.status(200).json({
      success: true,
      source: 'sample_detection',
      detectedItems: [
        { name: 'Eggs', category: 'dairy', quantity: 'Carton of 6', expiringSoon: false },
        { name: 'Bell Pepper', category: 'produce', quantity: '1 whole', expiringSoon: true },
        { name: 'Cherry Tomatoes', category: 'produce', quantity: 'Half container', expiringSoon: true },
        { name: 'Cheddar Cheese', category: 'dairy', quantity: '1 block', expiringSoon: false },
        { name: 'Baby Spinach', category: 'produce', quantity: 'Bag', expiringSoon: true },
        { name: 'Greek Yogurt', category: 'dairy', quantity: '1 tub', expiringSoon: false },
      ],
    });
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this photo of a refrigerator, pantry, countertop, or grocery receipt.
Identify all visible food ingredients, fresh produce, proteins, dairy, condiments, and pantry items.
For each item, classify its category (produce, protein, dairy, grains, canned, spices, sauces, bakery, other),
estimate quantity, and mark expiringSoon as true if it appears ripe, opened, leafy, or perishable.
Return ONLY a valid JSON object matching the schema.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'One of produce, protein, dairy, grains, canned, spices, sauces, bakery, other',
                  },
                  quantity: { type: Type.STRING },
                  expiringSoon: { type: Type.BOOLEAN },
                },
                required: ['name', 'category', 'expiringSoon'],
              },
            },
          },
          required: ['detectedItems'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json({
      success: true,
      source: 'gemini',
      detectedItems: parsed.detectedItems || [],
    });
  } catch (error: any) {
    console.error('Error parsing image with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze pantry photo',
    });
  }
});

// -------------------------------------------------------------
// Endpoint 3: POST /api/generate-meal-plan
// -------------------------------------------------------------
app.post('/api/generate-meal-plan', async (req, res) => {
  const { ingredients = [], days = 3, dietary = [], servings = 2 } = req.body;

  const ingredientNames = ingredients.map((i: any) => i.name).join(', ');

  const prompt = `Create a ${days}-day zero-waste meal plan (Breakfast, Lunch, Dinner, plus healthy snack idea) utilizing these ingredients:
${ingredientNames || 'Eggs, cheese, rice, vegetables, spices, beans'}

Dietary: ${dietary.join(', ') || 'Any'}
Servings: ${servings}

Crucial instruction: Make the meal plan progressively reuse perishable leftovers (e.g. Day 1 roasted veggies carry over into Day 2 lunch frittata or soup) to minimize waste.
Provide an estimated zeroWasteScore (80-99%) and a minimal grocery list of 3-5 staple items that complete the recipes.
Return ONLY valid JSON.`;

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.status(200).json({
      success: true,
      source: 'fallback',
      plan: null,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            zeroWasteScore: { type: Type.INTEGER },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dayName: { type: Type.STRING },
                  breakfastTitle: { type: Type.STRING },
                  breakfastDesc: { type: Type.STRING },
                  lunchTitle: { type: Type.STRING },
                  lunchDesc: { type: Type.STRING },
                  dinnerTitle: { type: Type.STRING },
                  dinnerDesc: { type: Type.STRING },
                  snack: { type: Type.STRING },
                  wasteReductionFocus: { type: Type.STRING },
                },
                required: [
                  'dayNumber',
                  'dayName',
                  'breakfastTitle',
                  'breakfastDesc',
                  'lunchTitle',
                  'lunchDesc',
                  'dinnerTitle',
                  'dinnerDesc',
                  'wasteReductionFocus',
                ],
              },
            },
            groceryList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  neededFor: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['item', 'neededFor', 'category'],
              },
            },
          },
          required: ['title', 'zeroWasteScore', 'days', 'groceryList'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json({
      success: true,
      source: 'gemini',
      plan: parsed,
    });
  } catch (err: any) {
    console.error('Error in meal plan:', err);
    return res.status(200).json({
      success: true,
      source: 'fallback',
      plan: null,
      error: err.message,
    });
  }
});

// -------------------------------------------------------------
// Endpoint 4: POST /api/recipe-assist
// -------------------------------------------------------------
app.post('/api/recipe-assist', async (req, res) => {
  const { recipeTitle, recipeIngredients, currentStep, userQuestion } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.status(200).json({
      answer: `Chef Tip: If you're missing an ingredient or need to adjust heat for "${recipeTitle}", you can substitute similar acid (lemon for vinegar), starch (cornstarch or flour), or dairy (yogurt for sour cream). Keep heat at medium to prevent scorching!`,
    });
  }

  try {
    const prompt = `You are a friendly, encouraging professional sous-chef standing right next to the user in their kitchen.
They are currently cooking: "${recipeTitle}".
Ingredients: ${Array.isArray(recipeIngredients) ? recipeIngredients.join(', ') : 'Pantry items'}
${currentStep ? `They are currently on Step: ${currentStep}` : ''}

User asked: "${userQuestion}"

Provide a concise, practical, warm 2-3 sentence answer explaining substitutions, cooking technique, timing cues, or heat troubleshooting immediately.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.status(200).json({
      answer: response.text?.trim() || 'Keep your pan at medium heat and season gradually to taste!',
    });
  } catch (err: any) {
    return res.status(200).json({
      answer: 'A great rule of thumb is to taste as you go and adjust heat to avoid scorching. You got this chef!',
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static File Serving
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PantryIQ Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
