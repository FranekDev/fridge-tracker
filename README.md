# 🧊 Fridge Tracker

A React Native (Expo) app for tracking what's in your fridge. Easily add products by scanning grocery receipts!

## Features

-   **Product Inventory**: View all products in your fridge with expiry tracking
-   **Receipt Scanning**: Capture or select receipt images to automatically add products
-   **Category Filtering**: Filter products by category (dairy, meat, vegetables, etc.)
-   **Expiry Alerts**: Visual indicators for expired or soon-to-expire items
-   **Dark Mode UI**: Beautiful, modern dark interface

## Tech Stack

-   **React Native** with **Expo** SDK
-   **TypeScript** for type safety
-   **React Navigation** for bottom tab navigation
-   **Expo Image Picker** for camera/gallery access
-   **Expo Haptics** for tactile feedback

## Getting Started

### Prerequisites

-   Node.js 18+
-   pnpm package manager
-   Expo Go app on your phone (for testing)

### Installation

```bash
# Navigate to the project
cd fridge-tracker

# Install dependencies
pnpm install

# Start the development server
pnpm start
```

### Running the App

After running `pnpm start`, you can:

-   Scan the QR code with Expo Go (Android) or Camera app (iOS)
-   Press `i` for iOS simulator
-   Press `a` for Android emulator
-   Press `w` for web browser

## Project Structure

```
fridge-tracker/
├── App.tsx                 # Main app with navigation
├── src/
│   ├── api/
│   │   └── mockApi.ts      # Mock backend API endpoints
│   ├── components/
│   │   ├── EmptyState.tsx
│   │   ├── LoadingOverlay.tsx
│   │   ├── ProductCard.tsx
│   │   └── ScannedProductsList.tsx
│   ├── screens/
│   │   ├── FridgeScreen.tsx
│   │   └── ScanScreen.tsx
│   ├── theme/
│   │   └── index.ts        # Colors, typography, spacing
│   └── types/
│       └── index.ts        # TypeScript interfaces
```

## Product Type

```typescript
interface Product {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: ProductCategory;
    addedAt: Date;
    expiresAt?: Date;
    price?: number;
}

type ProductCategory =
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
```

## License

MIT
