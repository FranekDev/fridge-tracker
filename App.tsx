import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FridgeScreen } from './src/screens/FridgeScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ReceiptsScreen } from './src/screens/ReceiptsScreen';
import { RecipesScreen } from './src/screens/RecipesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { Product } from './src/types';
import { colors, borderRadius, spacing, shadows } from './src/theme';
import { useAuth } from './src/hooks/useAuth';

const Tab = createBottomTabNavigator();

// Custom dark theme for navigation
const AppTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
        ...DefaultTheme.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.surfaceElevated,
        notification: colors.accent,
    },
};

// Tab bar icon components
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
    return (
        <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
            <Text style={styles.tabEmoji}>{emoji}</Text>
        </View>
    );
}

export default function App() {
    const { user, loading } = useAuth();
    const [newProducts, setNewProducts] = useState<Product[]>([]);

    const handleProductsScanned = useCallback((products: Product[]) => {
        setNewProducts(products);
    }, []);

    const handleProductsAdded = useCallback(() => {
        setNewProducts([]);
    }, []);

    // Loading state podczas sprawdzania sesji
    if (loading) {
        return (
            <SafeAreaProvider>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>Ładowanie...</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    // Jeśli nie zalogowany, pokaż ekran logowania
    if (!user) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <AuthScreen />
            </SafeAreaProvider>
        );
    }

    // Główna aplikacja dla zalogowanych użytkowników
    return (
        <SafeAreaProvider>
            <NavigationContainer theme={AppTheme}>
                <StatusBar style="light" />
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: styles.tabBar,
                        tabBarActiveTintColor: colors.accent,
                        tabBarInactiveTintColor: colors.textMuted,
                        tabBarLabelStyle: styles.tabLabel,
                        tabBarItemStyle: styles.tabItem,
                    }}
                >
                    <Tab.Screen
                        name="Fridge"
                        options={{
                            tabBarIcon: ({ focused }) => <TabIcon emoji="🧊" focused={focused} />,
                        }}
                    >
                        {() => (
                            <FridgeScreen newProducts={newProducts} onProductsAdded={handleProductsAdded} />
                        )}
                    </Tab.Screen>

                    <Tab.Screen
                        name="Receipts"
                        component={ReceiptsScreen}
                        options={{
                            tabBarIcon: ({ focused }) => <TabIcon emoji="🧾" focused={focused} />,
                        }}
                    />

                    <Tab.Screen
                        name="Recipes"
                        component={RecipesScreen}
                        options={{
                            tabBarIcon: ({ focused }) => <TabIcon emoji="🍽️" focused={focused} />,
                        }}
                    />

                    <Tab.Screen
                        name="Scan"
                        options={{
                            tabBarIcon: ({ focused }) => <TabIcon emoji="📸" focused={focused} />,
                        }}
                    >
                        {() => <ScanScreen onProductsScanned={handleProductsScanned} />}
                    </Tab.Screen>

                    <Tab.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{
                            tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: colors.textSecondary,
    },
    tabBar: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceElevated,
        paddingTop: spacing.xs,
        paddingBottom: spacing.sm,
        height: 80,
        ...shadows.lg,
    },
    tabItem: {
        paddingVertical: spacing.sm,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: spacing.xs,
    },
    tabIcon: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    tabIconFocused: {
        backgroundColor: colors.accent + '25',
        borderWidth: 1,
        borderColor: colors.accent,
    },
    tabEmoji: {
        fontSize: 22,
    },
});
