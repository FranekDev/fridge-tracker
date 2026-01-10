import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '../config/gemini.config';
import { Product, ApiResponse, SavedRecipe } from '../types';
import { supabase } from './supabase';

export interface RecipePreferences {
  priorityType: 'expiry' | 'none';
  prepTime: 'short' | 'medium' | 'long' | 'any';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage' | 'any';
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // minuty
  servings: number;
  matchingIngredients: string[]; // Składniki z lodówki
  missingIngredients: string[]; // Czego brakuje
}

function buildRecipePrompt(preferences?: RecipePreferences): string {
  const basePrompt = `Jesteś asystentem kulinarnym. Na podstawie listy produktów w lodówce sugeruj przepisy.

ZASADY:
1. Sugeruj 3-5 przepisów, które maksymalnie wykorzystują dostępne produkty
2. Zwracaj TYLKO poprawny JSON (bez markdown, bez dodatkowych tekstów, bez \`\`\`json)
3. W języku polskim`;

  const rules: string[] = [];

  // Priority type
  if (preferences?.priorityType === 'expiry') {
    rules.push('4. PRIORYTET: Wykorzystaj przede wszystkim produkty z krótkim terminem ważności (expires_at)');
  }

  // Prep time
  if (preferences?.prepTime === 'short') {
    rules.push('5. Przepisy powinny być bardzo szybkie (max 20 min przygotowania)');
  } else if (preferences?.prepTime === 'medium') {
    rules.push('5. Przepisy o średnim czasie przygotowania (20-40 min)');
  } else if (preferences?.prepTime === 'long') {
    rules.push('5. Przepisy mogą być bardziej złożone (>40 min przygotowania)');
  }

  // Meal type
  if (preferences?.mealType && preferences.mealType !== 'any') {
    const mealTypeMap = {
      breakfast: 'śniadanie',
      lunch: 'obiad',
      dinner: 'kolacja',
      snack: 'przekąska',
      beverage: 'napój',
    };
    rules.push(`6. Przepisy powinny być odpowiednie na: ${mealTypeMap[preferences.mealType]}`);
  }

  const allRules = rules.length > 0 ? '\n' + rules.join('\n') : '';

  return `${basePrompt}${allRules}

Format JSON:
{
  "recipes": [
    {
      "name": "Nazwa przepisu",
      "description": "Krótki opis (1-2 zdania)",
      "ingredients": ["składnik 1", "składnik 2", ...],
      "instructions": ["krok 1", "krok 2", ...],
      "prepTime": 20,
      "servings": 2,
      "matchingIngredients": ["mleko", "jajka"],
      "missingIngredients": ["mąka"]
    }
  ]
}`;
}

export async function suggestRecipes(
  products: Product[],
  preferences?: RecipePreferences
): Promise<ApiResponse<Recipe[]>> {
  try {
    if (products.length === 0) {
      return {
        data: [],
        success: false,
        error: 'Brak produktów w lodówce',
      };
    }

    // Inicjalizuj Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.model });

    // Sortuj produkty według terminu ważności jeśli priorytet to 'expiry'
    let sortedProducts = [...products];
    if (preferences?.priorityType === 'expiry') {
      sortedProducts.sort((a, b) => {
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return a.expiresAt.getTime() - b.expiresAt.getTime();
      });
    }

    // Przygotuj listę produktów
    const productsList = sortedProducts
      .map((p) => {
        const expiryInfo = p.expiresAt ? `, ważne do ${p.expiresAt.toLocaleDateString('pl-PL')}` : '';
        return `- ${p.name} (${p.quantity} ${p.unit})${expiryInfo}`;
      })
      .join('\n');

    const recipePrompt = buildRecipePrompt(preferences);
    const prompt = `${recipePrompt}

Mam w lodówce:
${productsList}

Zasugeruj przepisy w formacie JSON:`;

    // Wywołaj Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Usuń markdown code blocks jeśli istnieją
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parsuj JSON
    const parsed = JSON.parse(text);

    // Dodaj ID do każdego przepisu
    const recipes: Recipe[] = parsed.recipes.map((r: any, index: number) => ({
      ...r,
      id: `recipe-${Date.now()}-${index}`,
    }));

    return {
      data: recipes,
      success: true,
    };
  } catch (error) {
    console.error('suggestRecipes error:', error);
    return {
      data: [],
      success: false,
      error: 'Nie udało się wygenerować przepisów',
    };
  }
}

/**
 * Zapisuje przepis do bazy danych
 */
export async function saveRecipe(recipe: Recipe): Promise<ApiResponse<SavedRecipe>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: recipe.prepTime,
        servings: recipe.servings,
        image_url: null,
        matching_ingredients: recipe.matchingIngredients,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      data: transformDbRecipe(data),
      success: true,
    };
  } catch (error) {
    console.error('saveRecipe error:', error);
    return {
      data: null as any,
      success: false,
      error: 'Nie udało się zapisać przepisu',
    };
  }
}

/**
 * Pobiera wszystkie zapisane przepisy użytkownika
 */
export async function getSavedRecipes(): Promise<ApiResponse<SavedRecipe[]>> {
  try {
    const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });

    if (error) throw error;

    const recipes = data.map((dbRecipe) => transformDbRecipe(dbRecipe));

    return {
      data: recipes,
      success: true,
    };
  } catch (error) {
    console.error('getSavedRecipes error:', error);
    return {
      data: [],
      success: false,
      error: 'Nie udało się pobrać przepisów',
    };
  }
}

/**
 * Usuwa zapisany przepis
 */
export async function deleteRecipe(recipeId: string): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId);

    if (error) throw error;

    return {
      data: { deleted: true },
      success: true,
    };
  } catch (error) {
    console.error('deleteRecipe error:', error);
    return {
      data: { deleted: false },
      success: false,
      error: 'Nie udało się usunąć przepisu',
    };
  }
}

/**
 * Transformuje przepis z formatu DB do formatu aplikacji
 */
function transformDbRecipe(dbRecipe: any): SavedRecipe {
  return {
    id: dbRecipe.id,
    userId: dbRecipe.user_id,
    name: dbRecipe.name,
    description: dbRecipe.description,
    ingredients: dbRecipe.ingredients,
    instructions: dbRecipe.instructions,
    prepTime: dbRecipe.prep_time,
    servings: dbRecipe.servings,
    imageUrl: dbRecipe.image_url,
    matchingIngredients: dbRecipe.matching_ingredients || [],
    createdAt: new Date(dbRecipe.created_at),
    updatedAt: new Date(dbRecipe.updated_at),
  };
}
