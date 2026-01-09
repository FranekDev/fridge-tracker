import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { ReceiptScan } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface ReceiptCardProps {
  receipt: ReceiptScan;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ReceiptCard({ receipt, onPress, onLongPress }: ReceiptCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: receipt.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
          <View style={styles.thumbnailOverlay}>
            <Text style={styles.thumbnailIcon}>🧾</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.storeName} numberOfLines={1}>
            {receipt.storeName || 'Nieznany sklep'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{formatDate(receipt.purchaseDate)}</Text>
            </View>
          </View>

          {receipt.totalAmount && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Suma:</Text>
              <Text style={styles.amount}>{receipt.totalAmount.toFixed(2)} zł</Text>
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceElevated,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  storeName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  dateIcon: {
    fontSize: 12,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  amountLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  amount: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '700',
  },
});
