import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import { Product, ProductCategory } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface ScannedProductsListProps {
    products: Product[];
    selectedIds: Set<string>;
    onToggleProduct: (id: string) => void;
    onAddSelected: () => void;
    storeName?: string;
    totalAmount?: number;
}

const categoryEmojis: Record<ProductCategory, string> = {
    dairy: '🥛',
    meat: '🥩',
    vegetables: '🥬',
    fruits: '🍎',
    beverages: '🧃',
    bakery: '🍞',
    frozen: '🧊',
    snacks: '🍿',
    condiments: '🫙',
    other: '📦',
};

function ScannedProductItem({
    product,
    isSelected,
    onToggle,
}: {
    product: Product;
    isSelected: boolean;
    onToggle: () => void;
}) {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const categoryColor = colors.categories[product.category];

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
        onToggle();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
                onPress={handlePress}
                style={[styles.itemContainer, isSelected && styles.itemSelected]}
            >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <View style={[styles.emojiContainer, { backgroundColor: `${categoryColor}20` }]}>
                    <Text style={styles.emoji}>{categoryEmojis[product.category]}</Text>
                </View>

                <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{product.name}</Text>
                    <Text style={styles.itemMeta}>
                        {product.quantity} {product.unit}
                    </Text>
                </View>

                {product.price && <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>}
            </Pressable>
        </Animated.View>
    );
}

export function ScannedProductsList({
    products,
    selectedIds,
    onToggleProduct,
    onAddSelected,
    storeName,
    totalAmount,
}: ScannedProductsListProps) {
    const selectedCount = selectedIds.size;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Scanned Items</Text>
                    {storeName && (
                        <View style={styles.storeBadge}>
                            <Text style={styles.storeIcon}>🏪</Text>
                            <Text style={styles.storeName}>{storeName}</Text>
                        </View>
                    )}
                </View>
                {totalAmount && <Text style={styles.total}>Total: ${totalAmount.toFixed(2)}</Text>}
            </View>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ScannedProductItem
                        product={item}
                        isSelected={selectedIds.has(item.id)}
                        onToggle={() => onToggleProduct(item.id)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <View style={styles.selectionInfo}>
                    <Text style={styles.selectionCount}>
                        {selectedCount} of {products.length} selected
                    </Text>
                </View>
                <Pressable
                    style={[styles.addButton, selectedCount === 0 && styles.addButtonDisabled]}
                    onPress={onAddSelected}
                    disabled={selectedCount === 0}
                >
                    <Text style={styles.addButtonIcon}>+</Text>
                    <Text style={styles.addButtonText}>Add to Fridge</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: spacing.md,
        paddingTop: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceElevated,
    },
    headerContent: {
        flex: 1,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    storeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    storeIcon: {
        fontSize: 14,
    },
    storeName: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    total: {
        ...typography.h3,
        color: colors.accent,
    },
    listContent: {
        padding: spacing.sm,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginVertical: spacing.xs,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    itemSelected: {
        borderColor: colors.accent,
        backgroundColor: `${colors.accent}10`,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        borderColor: colors.textMuted,
        marginRight: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    checkmark: {
        color: colors.textInverse,
        fontSize: 14,
        fontWeight: '700',
    },
    emojiContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    emoji: {
        fontSize: 20,
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    itemMeta: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: 2,
    },
    itemPrice: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        paddingBottom: spacing.xl,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceElevated,
        ...shadows.lg,
    },
    selectionInfo: {
        flex: 1,
    },
    selectionCount: {
        ...typography.body,
        color: colors.textSecondary,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    addButtonDisabled: {
        backgroundColor: colors.surfaceElevated,
    },
    addButtonIcon: {
        fontSize: 20,
        color: colors.textInverse,
        fontWeight: '600',
    },
    addButtonText: {
        ...typography.body,
        color: colors.textInverse,
        fontWeight: '600',
    },
});
