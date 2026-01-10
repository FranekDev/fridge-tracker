import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Alert, Image, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useReceipts } from '../hooks/useReceipts';
import { ReceiptCard } from '../components/ReceiptCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ReceiptScan } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

export function ReceiptsScreen() {
  const { receipts, loading, error, refetch, deleteReceipt } = useReceipts();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptScan | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // Automatycznie odświeżaj paragony gdy użytkownik wraca do tej zakładki
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleReceiptPress = (receipt: ReceiptScan) => {
    setSelectedReceipt(receipt);
    setImageLoadError(null); // Resetuj błąd przy otwieraniu nowego modala
    setImageModalVisible(true);
  };

  const handleDeleteReceipt = (receipt: ReceiptScan) => {
    Alert.alert('Delete Receipt', `Delete receipt from ${receipt.storeName || 'unknown store'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReceipt(receipt.id);
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Receipt History</Text>
          <Text style={styles.subtitle}>
            {receipts.length} {receipts.length === 1 ? 'receipt' : 'receipts'}
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>🧾</Text>
        </View>
      </View>
    </View>
  );

  const renderImageModal = () => (
    <Modal visible={imageModalVisible} transparent animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
      <Pressable style={styles.modalOverlay} onPress={() => setImageModalVisible(false)}>
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedReceipt?.storeName || 'Receipt'}</Text>
              <Pressable onPress={() => setImageModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {selectedReceipt && (
              <>
                {selectedReceipt.imageUrl ? (
                  imageLoadError ? (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.placeholderIcon}>📷</Text>
                      <Text style={styles.placeholderTitle}>Failed to load image</Text>
                      <Text style={styles.placeholderError}>{imageLoadError}</Text>
                      <Text style={styles.placeholderHint}>
                        Check if 'receipts' bucket in Supabase Storage is public
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: selectedReceipt.imageUrl }}
                      style={styles.fullImage}
                      resizeMode="contain"
                      onError={(e) => {
                        console.error('[Image] Failed to load receipt image:', e.nativeEvent.error);
                        setImageLoadError(e.nativeEvent.error || 'Unknown error');
                      }}
                    />
                  )
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderIcon}>📷</Text>
                    <Text style={styles.placeholderTitle}>No receipt image</Text>
                    <Text style={styles.placeholderHint}>
                      Image was not saved during scanning
                    </Text>
                  </View>
                )}

                {selectedReceipt.products && selectedReceipt.products.length > 0 && (
                  <View style={styles.productsSection}>
                    <Text style={styles.productsSectionTitle}>
                      Scanned products ({selectedReceipt.products.length})
                    </Text>
                    <View style={styles.productsList}>
                      {selectedReceipt.products.map((product) => (
                        <View key={product.id} style={styles.productItem}>
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productDetails}>
                              {product.quantity} {product.unit}
                            </Text>
                          </View>
                          {product.price && <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </Pressable>
        </ScrollView>
      </Pressable>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingOverlay visible={true} message="Loading receipts..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <EmptyState icon="⚠️" title="Oops!" description={error} actionLabel="Try Again" onAction={refetch} />
      </SafeAreaView>
    );
  }

  if (receipts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <EmptyState icon="🧾" title="No Receipts" description="Your scanned receipts will appear here. Go to the Scan tab to add your first receipt." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReceiptCard receipt={item} onPress={() => handleReceiptPress(item)} onLongPress={() => handleDeleteReceipt(item)} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      />

      {renderImageModal()}
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
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  headerIcon: {
    fontSize: 28,
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 15, 0.95)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceElevated,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  fullImage: {
    width: '100%',
    height: 400,
  },
  imagePlaceholder: {
    width: '100%',
    height: 400,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  placeholderTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  placeholderError: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  placeholderHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  productsSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceElevated,
  },
  productsSectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  productsList: {
    gap: spacing.xs,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  productDetails: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  productPrice: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});
