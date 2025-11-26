export interface Product {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: ProductCategory;
    addedAt: Date;
    expiresAt?: Date;
    price?: number;
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
