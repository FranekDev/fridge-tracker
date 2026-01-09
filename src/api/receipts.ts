import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '../config/gemini.config';
import { ReceiptScanResult, Product, ProductCategory, ApiResponse, ReceiptScan } from '../types';
import { compressAndPrepareImage, uploadReceiptImage, getSignedUrl } from '../utils/imageHelpers';
import { supabase } from './supabase';

// Prompt dla Gemini do analizy paragonu
const RECEIPT_ANALYSIS_PROMPT = `Jesteś ekspertem w analizie paragonów spożywczych. Przeanalizuj zdjęcie paragonu i wyodrębnij informacje o produktach.

ZASADY:
1. Wyodrębnij nazwę produktu, ilość i cenę z każdej linii paragonu
2. Zidentyfikuj nazwę sklepu (zazwyczaj na górze paragonu)
3. Znajdź datę zakupu (jeśli widoczna)
4. Oblicz całkowitą kwotę (suma lub "RAZEM" na paragonie)
5. Dla każdego produktu przypisz odpowiednią kategorię:
   - dairy: mleko, ser, jogurt, masło, śmietana, twaróg, jajka
   - meat: mięso, kurczak, wołowina, wieprzowina, kiełbasa, ryby
   - vegetables: warzywa (pomidor, ogórek, sałata, marchew, cebula, itp.)
   - fruits: owoce (jabłko, banan, truskawka, pomarańcza, itp.)
   - beverages: napoje (sok, woda, cola, piwo, itp.)
   - bakery: pieczywo (chleb, bułka, bagietka, itp.)
   - frozen: mrożonki, lody
   - snacks: chipsy, przekąski, ciastka
   - condiments: sosy, musztarda, ketchup, przyprawy
   - other: wszystko inne
6. Szacuj ilość (quantity) i jednostkę (unit):
   - jeśli widać "kg", "g", "l", "ml" - użyj tego
   - jeśli tylko nazwa produktu - użyj quantity: 1, unit: "pcs" (sztuki)
7. Szacuj datę ważności (estimatedExpiryDays) od dzisiaj:
   - dairy: 10 dni
   - meat: 3 dni
   - vegetables: 5 dni
   - fruits: 7 dni
   - beverages: 60 dni
   - bakery: 5 dni
   - frozen: 180 dni
   - snacks: 180 dni
   - condiments: 180 dni
   - other: 30 dni

WAŻNE: Zwróć TYLKO poprawny JSON (bez markdown, bez \`\`\`json, bez dodatkowych tekstów).

Format JSON:
{
  "storeName": "Nazwa sklepu",
  "purchaseDate": "2024-01-08",
  "totalAmount": 45.67,
  "products": [
    {
      "name": "Mleko 2%",
      "quantity": 1,
      "unit": "L",
      "category": "dairy",
      "price": 3.99,
      "estimatedExpiryDays": 10
    },
    {
      "name": "Pomidory",
      "quantity": 500,
      "unit": "g",
      "category": "vegetables",
      "price": 5.49,
      "estimatedExpiryDays": 5
    }
  ]
}`;

async function analyzeReceiptWithGemini(imageUri: string): Promise<any> {
  try {
    // Inicjalizuj Gemini z obsługą vision
    const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_CONFIG.model, // Używamy modelu z konfiguracji
    });

    // Przeczytaj obraz jako base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]); // Usuń prefix "data:image/jpeg;base64,"
      };
      reader.readAsDataURL(blob);
    });

    // Wywołaj Gemini z obrazem
    const result = await model.generateContent([
      RECEIPT_ANALYSIS_PROMPT,
      {
        inlineData: {
          data: base64,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const textResponse = await result.response;
    let text = textResponse.text();

    // Usuń markdown code blocks jeśli istnieją
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function processReceipt(imageUri: string): Promise<ApiResponse<ReceiptScanResult>> {
  try {
    // 1. Kompresuj obraz
    const compressedUri = await compressAndPrepareImage(imageUri);

    // 2. Wywołaj Gemini API do analizy paragonu
    const geminiResult = await analyzeReceiptWithGemini(compressedUri);

    // 3. Sprawdź czy znaleziono produkty
    if (!geminiResult.products || geminiResult.products.length === 0) {
      return {
        data: {
          success: false,
          products: [],
        },
        success: false,
        error: 'Nie znaleziono produktów na paragonie. Spróbuj zrobić wyraźniejsze zdjęcie.',
      };
    }

    // 4. Pobierz użytkownika i zapisz paragon najpierw
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let imageUrl: string | undefined;
    let receiptId: string | undefined;

    // 5. Zapisz zdjęcie paragonu do Supabase Storage
    if (user) {
      imageUrl = (await uploadReceiptImage(compressedUri, user.id)) || undefined;

      if (!imageUrl) {
        console.warn('[Receipt] Failed to upload image to storage, but continuing with receipt creation');
      }
    }

    // 6. Zapisz metadane paragonu do tabeli receipts
    // UWAGA: Zapisujemy paragon nawet jeśli upload zdjęcia się nie powiódł
    if (user) {
      // Parsuj datę zakupu jeśli dostępna
      let purchaseDate = new Date();
      if (geminiResult.purchaseDate) {
        try {
          purchaseDate = new Date(geminiResult.purchaseDate);
        } catch {
          purchaseDate = new Date();
        }
      }

      const { data: receiptData, error: insertError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          image_url: imageUrl || null,  // Może być null jeśli upload się nie powiódł
          store_name: geminiResult.storeName || null,
          scan_date: purchaseDate.toISOString(),
          total_amount: geminiResult.totalAmount || null,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('[Receipt] Error saving receipt metadata:', insertError);
      } else if (receiptData) {
        receiptId = receiptData.id;
        console.log('[Receipt] Receipt saved with ID:', receiptId, 'Image URL:', imageUrl ? 'Yes' : 'No');
      }
    }

    // 7. Przekształć wynik Gemini na format Product z receiptId
    const products: Product[] = geminiResult.products.map((item: any, index: number) => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (item.estimatedExpiryDays || 30));

      return {
        id: `scanned-${Date.now()}-${index}`,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'pcs',
        category: item.category || 'other',
        addedAt: new Date(),
        expiresAt: expiryDate,
        price: item.price,
        receiptId: receiptId,
      };
    });

    return {
      data: {
        success: true,
        products,
        storeName: geminiResult.storeName,
        purchaseDate: geminiResult.purchaseDate ? new Date(geminiResult.purchaseDate) : new Date(),
        totalAmount: geminiResult.totalAmount,
      },
      success: true,
    };
  } catch (error) {
    console.error('processReceipt error:', error);
    return {
      data: {
        success: false,
        products: [],
      },
      success: false,
      error: 'Błąd podczas przetwarzania paragonu. Sprawdź połączenie z internetem i spróbuj ponownie.',
    };
  }
}

/**
 * Pobiera wszystkie zeskanowane paragony użytkownika wraz z produktami
 */
export async function getReceiptScans(): Promise<ApiResponse<ReceiptScan[]>> {
  try {
    // Pobierz paragony
    const { data: receiptsData, error: receiptsError } = await supabase
      .from('receipts')
      .select('*')
      .order('scan_date', { ascending: false });

    if (receiptsError) throw receiptsError;

    // Dla każdego paragonu, pobierz powiązane produkty
    const receiptsWithProducts = await Promise.all(
      receiptsData.map(async (r: any) => {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('receipt_id', r.id);

        if (productsError) {
          console.error('Error fetching products for receipt:', productsError);
        }

        const products: Product[] = productsData
          ? productsData.map((p: any) => ({
              id: p.id,
              name: p.name,
              quantity: p.quantity,
              unit: p.unit,
              category: p.category,
              addedAt: new Date(p.added_at),
              expiresAt: p.expires_at ? new Date(p.expires_at) : undefined,
              price: p.price,
              receiptId: p.receipt_id,
            }))
          : [];

        // Wygeneruj signed URL dla zdjęcia paragonu (jeśli istnieje)
        let imageUrl = r.image_url;
        if (imageUrl) {
          // Sprawdź czy to jest już signed URL (zawiera token) czy path
          if (!imageUrl.includes('token=')) {
            // To jest path - wygeneruj signed URL
            const signedUrl = await getSignedUrl('receipts', imageUrl, 3600);
            if (signedUrl) {
              imageUrl = signedUrl;
            } else {
              console.warn('[Receipt] Failed to generate signed URL for receipt:', r.id);
            }
          }
        }

        return {
          id: r.id,
          userId: r.user_id,
          imageUrl,
          storeName: r.store_name,
          purchaseDate: new Date(r.scan_date),
          totalAmount: r.total_amount,
          scannedAt: new Date(r.scan_date),
          createdAt: new Date(r.created_at),
          products,
        };
      })
    );

    return {
      data: receiptsWithProducts,
      success: true,
    };
  } catch (error) {
    console.error('getReceiptScans error:', error);
    return {
      data: [],
      success: false,
      error: 'Nie udało się pobrać paragonów',
    };
  }
}

/**
 * Usuwa zeskanowany paragon
 */
export async function deleteReceiptScan(receiptId: string): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    const { error } = await supabase.from('receipts').delete().eq('id', receiptId);

    if (error) throw error;

    return {
      data: { deleted: true },
      success: true,
    };
  } catch (error) {
    console.error('deleteReceiptScan error:', error);
    return {
      data: { deleted: false },
      success: false,
      error: 'Nie udało się usunąć paragonu',
    };
  }
}
