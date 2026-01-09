import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '../api/recipes';
import * as RecipesApi from '../api/recipes';
import { Product, SavedRecipe } from '../types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchRecipes = useCallback(async (products: Product[]) => {
    setLoading(true);
    setError(null);

    const response = await RecipesApi.suggestRecipes(products);

    if (response.success) {
      setRecipes(response.data);
    } else {
      setError(response.error || 'Błąd generowania przepisów');
    }

    setLoading(false);
    return response;
  }, []);

  const fetchSavedRecipes = useCallback(async () => {
    const response = await RecipesApi.getSavedRecipes();
    if (response.success) {
      setSavedRecipes(response.data);
    }
  }, []);

  const saveRecipe = useCallback(async (recipe: Recipe) => {
    const response = await RecipesApi.saveRecipe(recipe);
    if (response.success) {
      await fetchSavedRecipes();
    }
    return response;
  }, [fetchSavedRecipes]);

  const deleteRecipe = useCallback(async (recipeId: string) => {
    const response = await RecipesApi.deleteRecipe(recipeId);
    if (response.success) {
      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    }
    return response;
  }, []);

  return {
    recipes,
    savedRecipes,
    loading,
    error,
    fetchRecipes,
    saveRecipe,
    deleteRecipe,
    fetchSavedRecipes,
  };
}
