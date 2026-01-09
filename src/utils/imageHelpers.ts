import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../api/supabase';

export async function compressAndPrepareImage(uri: string) {
  try {
    // Kompresuj do max 1200px szerokości
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    return uri; // Zwróć oryginalny jeśli błąd
  }
}

export async function uploadReceiptImage(uri: string, userId: string): Promise<string | null> {
  try {
    // Unikalny filename
    const filename = `${userId}/${Date.now()}.jpg`;

    console.log('[Upload] Starting receipt image upload:', { filename, userId });

    // Przeczytaj plik jako ArrayBuffer (działa w React Native)
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    console.log('[Upload] File prepared, size:', fileData.length, 'bytes');

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filename, fileData, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Upload] Supabase storage error:', {
        message: error.message,
        error: error,
      });
      throw error;
    }

    console.log('[Upload] Upload successful:', data.path);

    // Zwróć TYLKO ścieżkę (nie signed URL)
    return data.path;
  } catch (error: any) {
    console.error('[Upload] Image upload error:', {
      message: error?.message,
      error: error,
    });

    // Zwróć informacje o błędzie w bardziej przystępny sposób
    if (error?.message?.includes('Bucket not found') || error?.message?.includes('not found')) {
      console.error('[Upload] ❌ BUCKET "receipts" NOT FOUND! Please create it in Supabase Dashboard:');
      console.error('[Upload] 1. Go to Supabase Dashboard > Storage');
      console.error('[Upload] 2. Create new bucket named "receipts"');
      console.error('[Upload] 3. Set it as PUBLIC bucket');
      console.error('[Upload] 4. Or run migration: src/sql/11_create_storage_buckets.sql');
    }

    return null;
  }
}

/**
 * Uploaduje base64 obraz do Supabase Storage (dla przepisów)
 */
export async function uploadRecipeImageFromBase64(
  base64Data: string,
  userId: string,
  recipeName: string
): Promise<string | null> {
  try {
    const sanitizedName = recipeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50);

    const filename = `${userId}/${Date.now()}-${sanitizedName}.jpg`;

    const base64Response = await fetch(`data:image/jpeg;base64,${base64Data}`);
    const arrayBuffer = await base64Response.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('recipes')
      .upload(filename, fileData, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    return data.path;
  } catch (error) {
    console.error('uploadRecipeImageFromBase64 error:', error);
    return null;
  }
}

/**
 * Generuje signed URL dla ścieżki w Storage
 * Używane do odświeżania wygasłych URLi
 */
export async function getSignedUrl(
  bucket: 'receipts' | 'recipes',
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    // Wyodrębnij czystą ścieżkę z pełnego URL jeśli potrzeba
    let cleanPath = path;

    // Jeśli path zawiera pełny URL, wyodrębnij tylko ścieżkę pliku
    if (path.includes('http')) {
      const match = path.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+?)(?:\?|$)/);
      if (match) {
        cleanPath = match[1];
        console.log(`[SignedURL] Extracted path from URL: ${path} -> ${cleanPath}`);
      } else {
        console.error(`[SignedURL] Could not extract path from URL: ${path}`);
        return null;
      }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresIn);

    if (error) {
      console.error(`[SignedURL] Failed to generate signed URL for ${bucket}/${cleanPath}:`, error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('[SignedURL] Error:', error);
    return null;
  }
}
