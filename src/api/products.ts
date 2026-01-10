import { supabase } from './supabase';
import { Product, ApiResponse } from '../types';

// Transformacja z formatu DB do formatu App
function transformDbProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    quantity: dbProduct.quantity,
    unit: dbProduct.unit,
    category: dbProduct.category,
    addedAt: new Date(dbProduct.added_at),
    expiresAt: dbProduct.expires_at ? new Date(dbProduct.expires_at) : undefined,
    price: dbProduct.price,
    receiptId: dbProduct.receipt_id || undefined,
  };
}

// Transformacja z formatu App do formatu DB
function transformAppProduct(product: Omit<Product, 'id'>) {
  return {
    name: product.name,
    quantity: product.quantity,
    unit: product.unit,
    category: product.category,
    price: product.price,
    added_at: product.addedAt.toISOString(),
    expires_at: product.expiresAt?.toISOString() || null,
    receipt_id: product.receiptId || null,
  };
}

export async function getMyProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const products = data.map(transformDbProduct);

    return { data: products, success: true };
  } catch (error) {
    console.error('getMyProducts error:', error);
    return {
      data: [],
      success: false,
      error: 'Nie udało się pobrać produktów',
    };
  }
}

export async function addProducts(products: Product[]): Promise<ApiResponse<{ added: number }>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dbProducts = products.map((p) => ({
      ...transformAppProduct(p),
      user_id: user.id,
    }));

    const { error } = await supabase.from('products').insert(dbProducts);

    if (error) throw error;

    return { data: { added: products.length }, success: true };
  } catch (error) {
    console.error('addProducts error:', error);
    return {
      data: { added: 0 },
      success: false,
      error: 'Nie udało się dodać produktów',
    };
  }
}

export async function removeProduct(productId: string): Promise<ApiResponse<{ removed: boolean }>> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) throw error;

    return { data: { removed: true }, success: true };
  } catch (error) {
    console.error('removeProduct error:', error);
    return {
      data: { removed: false },
      success: false,
      error: 'Nie udało się usunąć produktu',
    };
  }
}

export async function updateProductExpiry(
  productId: string,
  expiresAt: Date
): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ expires_at: expiresAt.toISOString() })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    return {
      data: transformDbProduct(data),
      success: true,
    };
  } catch (error) {
    console.error('updateProductExpiry error:', error);
    return {
      data: null as any,
      success: false,
      error: 'Nie udało się zaktualizować daty ważności',
    };
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'addedAt'>>
): Promise<ApiResponse<Product>> {
  try {
    const dbUpdates: any = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.expiresAt !== undefined) {
      dbUpdates.expires_at = updates.expiresAt ? updates.expiresAt.toISOString() : null;
    }
    if (updates.price !== undefined) dbUpdates.price = updates.price;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    return {
      data: transformDbProduct(data),
      success: true,
    };
  } catch (error) {
    console.error('updateProduct error:', error);
    return {
      data: null as any,
      success: false,
      error: 'Nie udało się zaktualizować produktu',
    };
  }
}
