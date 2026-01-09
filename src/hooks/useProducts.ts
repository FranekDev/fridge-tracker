import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import * as ProductsApi from '../api/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await ProductsApi.getMyProducts();

    if (response.success) {
      setProducts(response.data);
    } else {
      setError(response.error || 'Błąd pobierania');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProducts = useCallback(async (newProducts: Product[]) => {
    const response = await ProductsApi.addProducts(newProducts);
    if (response.success) {
      await fetchProducts(); // Odśwież listę
    }
    return response;
  }, [fetchProducts]);

  const removeProduct = useCallback(async (productId: string) => {
    const response = await ProductsApi.removeProduct(productId);
    if (response.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
    return response;
  }, []);

  const updateExpiry = useCallback(async (productId: string, expiresAt: Date) => {
    const response = await ProductsApi.updateProductExpiry(productId, expiresAt);
    if (response.success) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? response.data : p)));
    }
    return response;
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProducts,
    removeProduct,
    updateExpiry,
  };
}
