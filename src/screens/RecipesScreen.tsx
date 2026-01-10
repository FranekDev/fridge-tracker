import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '../hooks/useProducts';
import { useRecipes } from '../hooks/useRecipes';
import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { RecipePreferencesModal, RecipePreferences } from '../components';
import { Recipe } from '../api/recipes';
import { SavedRecipe } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

export function RecipesScreen() {
  const { products, refetch: refetchProducts } = useProducts();
  const { savedRecipes, loading, error, fetchRecipes, saveRecipe, deleteRecipe } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | SavedRecipe | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);

  const handleOpenPreferences = () => {
    setPreferencesModalVisible(true);
  };

  const handleGenerateRecipes = async (preferences: RecipePreferences) => {
    setPreferencesModalVisible(false);
    
    // Odśwież listę produktów przed sprawdzeniem
    const productsResponse = await refetchProducts();
    
    if (!productsResponse || !productsResponse.success || productsResponse.data.length === 0) {
      Alert.alert('Pusta lodówka', 'Dodaj produkty do lodówki, aby wygenerować przepisy.');
      return;
    }

    const recipeResponse = await fetchRecipes(productsResponse.data, preferences);

    if (!recipeResponse.success) {
      Alert.alert('Błąd', recipeResponse.error || 'Nie udało się wygenerować przepisów');
      return;
    }

    if (recipeResponse.data.length === 0) {
      Alert.alert('Brak przepisów', 'Nie znaleziono przepisów dla dostępnych produktów.');
      return;
    }

    // Auto-save first recipe
    const firstRecipe = recipeResponse.data[0];
    await saveRecipe(firstRecipe);

    // Show first recipe
    setSelectedRecipe(firstRecipe);
    setDetailModalVisible(true);
  };

  const handleRecipePress = (recipe: Recipe | SavedRecipe) => {
    setSelectedRecipe(recipe);
    setDetailModalVisible(true);
  };

  const handleDeleteRecipe = async () => {
    if (!selectedRecipe || !('userId' in selectedRecipe)) return;

    Alert.alert('Usuń przepis', `Usunąć przepis "${selectedRecipe.name}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destr kuctive',
        onPress: async () => {
          await deleteRecipe(selectedRecipe.id);
          setDetailModalVisible(false);
          setSelectedRecipe(null);
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Recipe Ideas</Text>
          <Text style={styles.subtitle}>
            {savedRecipes.length} {savedRecipes.length === 1 ? 'przepis' : 'przepisów'} zapisanych
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>🍽️</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.generateButton, styles.generateButtonPrimary]}
          onPress={handleOpenPreferences}
          disabled={loading}
        >
          <Text style={styles.generateButtonIcon}>✨</Text>
          <Text style={styles.generateButtonTextPrimary}>Generate awesome recipe</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedRecipe) return null;

    const hasImage = 'imageUrl' in selectedRecipe && selectedRecipe.imageUrl;

    return (
      <Modal visible={detailModalVisible} transparent animationType="slide" onRequestClose={() => setDetailModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {hasImage && (
                <View style={styles.modalImageContainer}>
                  <Text style={styles.modalImagePlaceholder}>🍽️</Text>
                </View>
              )}

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                <Text style={styles.modalDescription}>{selectedRecipe.description}</Text>

                <View style={styles.modalMetaRow}>
                  <View style={styles.modalMetaBadge}>
                    <Text style={styles.modalMetaIcon}>⏱️</Text>
                    <Text style={styles.modalMetaText}>{selectedRecipe.prepTime} min</Text>
                  </View>

                  <View style={styles.modalMetaBadge}>
                    <Text style={styles.modalMetaIcon}>🍽️</Text>
                    <Text style={styles.modalMetaText}>{selectedRecipe.servings} porcje</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.listItemText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Instructions</Text>
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.stepNumber}>{index + 1}.</Text>
                      <Text style={styles.listItemText}>{instruction}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <Pressable style={styles.closeButton} onPress={() => setDetailModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>

                  {'userId' in selectedRecipe && (
                    <Pressable style={styles.deleteButton} onPress={handleDeleteRecipe}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingOverlay visible={true} message="Generating recipes..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <EmptyState icon="⚠️" title="Ups!" description={error} />
      </SafeAreaView>
    );
  }

  if (savedRecipes.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <EmptyState
          icon="🍽️"
          title="No saved recipes"
          description="Generate recipe ideas from your fridge products. Tap the button above to get started!"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      <FlatList
        data={savedRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {renderDetailModal()}
      
      {/* Preferences Modal */}
      <RecipePreferencesModal
        visible={preferencesModalVisible}
        onClose={() => setPreferencesModalVisible(false)}
        onGenerate={handleGenerateRecipes}
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
    paddingBottom: spacing.md,
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  generateButtonPrimary: {
    backgroundColor: colors.accent,
    ...shadows.sm,
  },
  generateButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.surfaceElevated,
  },
  generateButtonIcon: {
    fontSize: 18,
  },
  generateButtonTextPrimary: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  generateButtonTextSecondary: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 15, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    ...shadows.lg,
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImagePlaceholder: {
    fontSize: 80,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  modalMetaIcon: {
    fontSize: 16,
  },
  modalMetaText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  bullet: {
    ...typography.body,
    color: colors.accent,
    marginRight: spacing.sm,
    width: 20,
  },
  stepNumber: {
    ...typography.body,
    color: colors.accent,
    marginRight: spacing.sm,
    width: 24,
    fontWeight: '600',
  },
  listItemText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error + '20',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
});
