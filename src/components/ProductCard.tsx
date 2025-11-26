import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Product, ProductCategory } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface ProductCardProps {
    product: Product;
    onPress?: () => void;
    onLongPress?: () => void;
    style?: object;
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

const categoryLabels: Record<ProductCategory, string> = {
    dairy: 'Dairy',
    meat: 'Meat',
    vegetables: 'Veggies',
    fruits: 'Fruits',
    beverages: 'Drinks',
    bakery: 'Bakery',
    frozen: 'Frozen',
    snacks: 'Snacks',
    condiments: 'Condiments',
    other: 'Other',
};

function getDaysUntilExpiry(expiresAt?: Date): number | null {
    if (!expiresAt) return null;
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getExpiryStatus(days: number | null): 'expired' | 'expiring' | 'fresh' | 'unknown' {
    if (days === null) return 'unknown';
    if (days < 0) return 'expired';
    if (days <= 2) return 'expiring';
    return 'fresh';
}

export function ProductCard({ product, onPress, onLongPress, style }: ProductCardProps) {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const daysUntilExpiry = getDaysUntilExpiry(product.expiresAt);
    const expiryStatus = getExpiryStatus(daysUntilExpiry);
    const categoryColor = colors.categories[product.category];

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const getExpiryText = () => {
        if (daysUntilExpiry === null) return null;
        if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)}d ago`;
        if (daysUntilExpiry === 0) return 'Expires today';
        if (daysUntilExpiry === 1) return 'Expires tomorrow';
        return `${daysUntilExpiry} days left`;
    };

    const getExpiryColor = () => {
        switch (expiryStatus) {
            case 'expired':
                return colors.error;
            case 'expiring':
                return colors.warning;
            case 'fresh':
                return colors.success;
            default:
                return colors.textMuted;
        }
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <Pressable
                onPress={onPress}
                onLongPress={onLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.container}
            >
                <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />

                <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{categoryEmojis[product.category]}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.name} numberOfLines={1}>
                        {product.name}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
                            <Text style={[styles.categoryText, { color: categoryColor }]}>
                                {categoryLabels[product.category]}
                            </Text>
                        </View>

                        <Text style={styles.quantity}>
                            {product.quantity} {product.unit}
                        </Text>
                    </View>
                </View>

                <View style={styles.rightSection}>
                    {product.price && <Text style={styles.price}>${product.price.toFixed(2)}</Text>}
                    {getExpiryText() && (
                        <View style={[styles.expiryBadge, { backgroundColor: `${getExpiryColor()}15` }]}>
                            <View style={[styles.expiryDot, { backgroundColor: getExpiryColor() }]} />
                            <Text style={[styles.expiryText, { color: getExpiryColor() }]}>
                                {getExpiryText()}
                            </Text>
                        </View>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginHorizontal: spacing.md,
        marginVertical: spacing.xs,
        ...shadows.sm,
        overflow: 'hidden',
    },
    categoryIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: borderRadius.lg,
        borderBottomLeftRadius: borderRadius.lg,
    },
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    emoji: {
        fontSize: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    categoryBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    categoryText: {
        ...typography.caption,
        fontWeight: '600',
    },
    quantity: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginLeft: spacing.sm,
    },
    price: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    expiryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    expiryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    expiryText: {
        ...typography.caption,
    },
});
