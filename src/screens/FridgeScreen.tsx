import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product, ProductCategory } from '../types';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

type FilterType = 'all' | ProductCategory;

const filters: { key: FilterType; label: string; emoji: string }[] = [
    { key: 'all', label: 'All', emoji: '📦' },
    { key: 'dairy', label: 'Dairy', emoji: '🥛' },
    { key: 'meat', label: 'Meat', emoji: '🥩' },
    { key: 'vegetables', label: 'Veggies', emoji: '🥬' },
    { key: 'fruits', label: 'Fruits', emoji: '🍎' },
    { key: 'beverages', label: 'Drinks', emoji: '🧃' },
    { key: 'bakery', label: 'Bakery', emoji: '🍞' },
    { key: 'frozen', label: 'Frozen', emoji: '🧊' },
];

interface FridgeScreenProps {
    newProducts?: Product[];
    onProductsAdded?: () => void;
}

export function FridgeScreen({ newProducts, onProductsAdded }: FridgeScreenProps) {
    const {
        products,
        loading,
        error,
        refetch,
        addProducts: addProductsToDb,
        removeProduct: removeProductFromDb,
    } = useProducts();

    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    const headerAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate header on mount
        Animated.spring(headerAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, []);

    // Handle new products from scanning
    useEffect(() => {
        if (newProducts && newProducts.length > 0) {
            // Dodaj produkty do bazy danych
            addProductsToDb(newProducts).then(() => {
                onProductsAdded?.();
            });
        }
    }, [newProducts]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleDeleteProduct = (product: Product) => {
        Alert.alert('Remove from Fridge', `Are you sure you want to remove "${product.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    await removeProductFromDb(product.id);
                },
            },
        ]);
    };

    const filteredProducts =
        activeFilter === 'all' ? products : products.filter((p) => p.category === activeFilter);

    const groupedByCategory = filteredProducts.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
    }, {} as Record<ProductCategory, Product[]>);

    const getCategoryCount = (category: FilterType): number => {
        if (category === 'all') return products.length;
        return products.filter((p) => p.category === category).length;
    };

    const renderHeader = () => (
        <Animated.View
            style={[
                styles.header,
                {
                    opacity: headerAnim,
                    transform: [
                        {
                            translateY: headerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greeting}>Your Fridge</Text>
                    <Text style={styles.subtitle}>
                        {products.length} {products.length === 1 ? 'item' : 'items'} stored
                    </Text>
                </View>
                <View style={styles.fridgeIconContainer}>
                    <Text style={styles.fridgeIcon}>🧊</Text>
                </View>
            </View>

            {/* Filter Pills */}
            <FlatList
                horizontal
                data={filters}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
                renderItem={({ item }) => {
                    const count = getCategoryCount(item.key);
                    const isActive = activeFilter === item.key;
                    return (
                        <Pressable
                            onPress={() => setActiveFilter(item.key)}
                            style={[styles.filterPill, isActive && styles.filterPillActive]}
                        >
                            <Text style={styles.filterEmoji}>{item.emoji}</Text>
                            <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                                {item.label}
                            </Text>
                            {count > 0 && (
                                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                                    <Text
                                        style={[
                                            styles.filterCountText,
                                            isActive && styles.filterCountTextActive,
                                        ]}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    );
                }}
            />
        </Animated.View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <LoadingOverlay visible={true} message="Loading your fridge..." />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                {renderHeader()}
                <EmptyState
                    icon="⚠️"
                    title="Oops!"
                    description={error}
                    actionLabel="Try Again"
                    onAction={refetch}
                />
            </SafeAreaView>
        );
    }

    if (products.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                {renderHeader()}
                <EmptyState
                    icon="🧊"
                    title="Your fridge is empty"
                    description="Start by scanning a grocery receipt to add your first items."
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View
                        style={{
                            opacity: headerAnim,
                            transform: [
                                {
                                    translateX: headerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        <ProductCard product={item} onLongPress={() => handleDeleteProduct(item)} />
                    </Animated.View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.accent}
                        colors={[colors.accent]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyFilter}>
                        <Text style={styles.emptyFilterText}>No items in this category</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    greeting: {
        ...typography.h1,
        color: colors.textPrimary,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    fridgeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    fridgeIcon: {
        fontSize: 28,
    },
    filterContainer: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.surfaceElevated,
    },
    filterPillActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    filterEmoji: {
        fontSize: 16,
    },
    filterLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    filterLabelActive: {
        color: colors.textInverse,
    },
    filterCount: {
        backgroundColor: colors.surfaceHighlight,
        paddingHorizontal: spacing.xs + 2,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        minWidth: 20,
        alignItems: 'center',
    },
    filterCountActive: {
        backgroundColor: colors.accentDark,
    },
    filterCountText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    filterCountTextActive: {
        color: colors.textPrimary,
    },
    listContent: {
        paddingVertical: spacing.sm,
        paddingBottom: spacing.xxl,
    },
    emptyFilter: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyFilterText: {
        ...typography.body,
        color: colors.textMuted,
    },
});
