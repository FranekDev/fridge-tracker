import { Product, ReceiptScanResult, ApiResponse, ProductCategory } from '../types';

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data for products in the fridge
const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Organic Whole Milk',
        quantity: 1,
        unit: 'L',
        category: 'dairy',
        addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        price: 4.99,
    },
    {
        id: '2',
        name: 'Free-Range Eggs',
        quantity: 12,
        unit: 'pcs',
        category: 'dairy',
        addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        price: 6.49,
    },
    {
        id: '3',
        name: 'Chicken Breast',
        quantity: 500,
        unit: 'g',
        category: 'meat',
        addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        price: 8.99,
    },
    {
        id: '4',
        name: 'Fresh Spinach',
        quantity: 200,
        unit: 'g',
        category: 'vegetables',
        addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        price: 3.49,
    },
    {
        id: '5',
        name: 'Greek Yogurt',
        quantity: 500,
        unit: 'g',
        category: 'dairy',
        addedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        price: 5.29,
    },
    {
        id: '6',
        name: 'Orange Juice',
        quantity: 1,
        unit: 'L',
        category: 'beverages',
        addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        price: 4.49,
    },
    {
        id: '7',
        name: 'Strawberries',
        quantity: 400,
        unit: 'g',
        category: 'fruits',
        addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        price: 5.99,
    },
    {
        id: '8',
        name: 'Sourdough Bread',
        quantity: 1,
        unit: 'loaf',
        category: 'bakery',
        addedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        price: 4.99,
    },
];

// Products that could be "scanned" from a receipt
const scannableProducts: Omit<Product, 'id' | 'addedAt'>[] = [
    { name: 'Avocados', quantity: 3, unit: 'pcs', category: 'fruits', price: 4.99 },
    { name: 'Cheddar Cheese', quantity: 200, unit: 'g', category: 'dairy', price: 5.49 },
    { name: 'Ground Beef', quantity: 500, unit: 'g', category: 'meat', price: 9.99 },
    { name: 'Tomatoes', quantity: 6, unit: 'pcs', category: 'vegetables', price: 3.99 },
    { name: 'Almond Milk', quantity: 1, unit: 'L', category: 'beverages', price: 4.29 },
    { name: 'Frozen Pizza', quantity: 1, unit: 'pcs', category: 'frozen', price: 7.99 },
    { name: 'Potato Chips', quantity: 150, unit: 'g', category: 'snacks', price: 3.49 },
    { name: 'Mustard', quantity: 250, unit: 'ml', category: 'condiments', price: 2.99 },
    { name: 'Blueberries', quantity: 250, unit: 'g', category: 'fruits', price: 6.49 },
    { name: 'Butter', quantity: 250, unit: 'g', category: 'dairy', price: 4.99 },
];

/**
 * Mock API: Get all products currently in the fridge
 */
export async function getMyProducts(): Promise<ApiResponse<Product[]>> {
    // Simulate network delay
    await delay(800);

    // Simulate occasional network errors (5% chance)
    if (Math.random() < 0.05) {
        return {
            data: [],
            success: false,
            error: 'Network error. Please try again.',
        };
    }

    return {
        data: mockProducts,
        success: true,
    };
}

/**
 * Mock API: Process a receipt image and extract products
 * @param imageUri - The local URI of the receipt image
 */
export async function processReceipt(imageUri: string): Promise<ApiResponse<ReceiptScanResult>> {
    // Simulate OCR processing time
    await delay(2500);

    // Simulate occasional OCR failures (10% chance)
    if (Math.random() < 0.1) {
        return {
            data: {
                success: false,
                products: [],
            },
            success: false,
            error: 'Could not read the receipt. Please try again with a clearer image.',
        };
    }

    // Generate random products from the scannableProducts list
    const numberOfProducts = Math.floor(Math.random() * 5) + 3; // 3-7 products
    const shuffled = [...scannableProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, numberOfProducts);

    const products: Product[] = selectedProducts.map((product, index) => ({
        ...product,
        id: `scanned-${Date.now()}-${index}`,
        addedAt: new Date(),
        expiresAt: new Date(Date.now() + (7 + Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000),
    }));

    const totalAmount = products.reduce((sum, p) => sum + (p.price || 0), 0);

    return {
        data: {
            success: true,
            products,
            storeName: ['Whole Foods', "Trader Joe's", 'Safeway', 'Costco'][Math.floor(Math.random() * 4)],
            purchaseDate: new Date(),
            totalAmount: Math.round(totalAmount * 100) / 100,
        },
        success: true,
    };
}

/**
 * Mock API: Add products to the fridge
 */
export async function addProducts(products: Product[]): Promise<ApiResponse<{ added: number }>> {
    await delay(500);

    // In a real app, this would persist to a backend
    // For now, we just simulate success
    return {
        data: { added: products.length },
        success: true,
    };
}

/**
 * Mock API: Remove a product from the fridge
 */
export async function removeProduct(productId: string): Promise<ApiResponse<{ removed: boolean }>> {
    await delay(300);

    return {
        data: { removed: true },
        success: true,
    };
}
