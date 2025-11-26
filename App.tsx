import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FridgeScreen } from './src/screens/FridgeScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { Product } from './src/types';
import { colors, borderRadius, spacing, shadows } from './src/theme';

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
    const [newProducts, setNewProducts] = useState<Product[]>([]);

    const handleProductsScanned = useCallback((products: Product[]) => {
        setNewProducts(products);
    }, []);

    const handleProductsAdded = useCallback(() => {
        setNewProducts([]);
    }, []);

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
                        name="Scan"
                        options={{
                            tabBarIcon: ({ focused }) => <TabIcon emoji="📸" focused={focused} />,
                        }}
                    >
                        {() => <ScanScreen onProductsScanned={handleProductsScanned} />}
                    </Tab.Screen>
                </Tab.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
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
