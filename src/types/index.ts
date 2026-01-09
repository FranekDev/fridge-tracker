export interface Product {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: ProductCategory;
    addedAt: Date;
    expiresAt?: Date;
    price?: number;
    receiptId?: string;
}

export type ProductCategory =
    | 'dairy'
    | 'meat'
    | 'vegetables'
    | 'fruits'
    | 'beverages'
    | 'bakery'
    | 'frozen'
    | 'snacks'
    | 'condiments'
    | 'other';

export interface ReceiptScanResult {
    success: boolean;
    products: Product[];
    storeName?: string;
    purchaseDate?: Date;
    totalAmount?: number;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    error?: string;
}

export interface SavedRecipe {
    id: string;
    userId: string;
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    servings: number;
    imageUrl?: string;
    matchingIngredients: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ReceiptScan {
    id: string;
    userId: string;
    imageUrl: string;
    storeName?: string;
    purchaseDate: Date;
    totalAmount?: number;
    scannedAt: Date;
    createdAt: Date;
    products?: Product[];
}
