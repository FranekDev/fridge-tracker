import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Pressable,
    ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

export interface RecipePreferences {
    priorityType: 'expiry' | 'none';
    prepTime: 'short' | 'medium' | 'long' | 'any';
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage' | 'any';
}

interface RecipePreferencesModalProps {
    visible: boolean;
    onClose: () => void;
    onGenerate: (preferences: RecipePreferences) => void;
}

const prepTimeOptions = [
    { key: 'short' as const, label: 'Short (<20 min)', emoji: '⚡' },
    { key: 'medium' as const, label: 'Medium (20-40 min)', emoji: '⏱️' },
    { key: 'long' as const, label: 'Long (>40 min)', emoji: '🕐' },
    { key: 'any' as const, label: 'Any', emoji: '🤷' },
];

const mealTypeOptions = [
    { key: 'breakfast' as const, label: 'Breakfast', emoji: '🍳' },
    { key: 'lunch' as const, label: 'Lunch', emoji: '🍽️' },
    { key: 'dinner' as const, label: 'Dinner', emoji: '🌙' },
    { key: 'snack' as const, label: 'Snack', emoji: '🍿' },
    { key: 'beverage' as const, label: 'Beverage', emoji: '🥤' },
    { key: 'any' as const, label: 'Any', emoji: '✨' },
];

export function RecipePreferencesModal({ visible, onClose, onGenerate }: RecipePreferencesModalProps) {
    const [priorityType, setPriorityType] = useState<'expiry' | 'none'>('expiry');
    const [prepTime, setPrepTime] = useState<'short' | 'medium' | 'long' | 'any'>('any');
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage' | 'any'>('any');

    const handleGenerate = () => {
        onGenerate({
            priorityType,
            prepTime,
            mealType,
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Recipe Preferences</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        {/* Priority Type */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Product Priority</Text>
                            <Text style={styles.sectionDescription}>
                                How should products be selected for the recipe?
                            </Text>
                            <View style={styles.optionsRow}>
                                <Pressable
                                    onPress={() => setPriorityType('expiry')}
                                    style={[
                                        styles.optionCard,
                                        priorityType === 'expiry' && styles.optionCardActive,
                                    ]}
                                >
                                    <Text style={styles.optionEmoji}>⏰</Text>
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            priorityType === 'expiry' && styles.optionLabelActive,
                                        ]}
                                    >
                                        Short Expiry Date
                                    </Text>
                                    <Text style={styles.optionDescription}>
                                        Use products that will expire soon
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => setPriorityType('none')}
                                    style={[
                                        styles.optionCard,
                                        priorityType === 'none' && styles.optionCardActive,
                                    ]}
                                >
                                    <Text style={styles.optionEmoji}>🎲</Text>
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            priorityType === 'none' && styles.optionLabelActive,
                                        ]}
                                    >
                                        Any
                                    </Text>
                                    <Text style={styles.optionDescription}>
                                        Any products from the fridge
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Prep Time */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Preparation Time</Text>
                            <View style={styles.optionsGrid}>
                                {prepTimeOptions.map((option) => (
                                    <Pressable
                                        key={option.key}
                                        onPress={() => setPrepTime(option.key)}
                                        style={[
                                            styles.gridOption,
                                            prepTime === option.key && styles.gridOptionActive,
                                        ]}
                                    >
                                        <Text style={styles.gridOptionEmoji}>{option.emoji}</Text>
                                        <Text
                                            style={[
                                                styles.gridOptionLabel,
                                                prepTime === option.key && styles.gridOptionLabelActive,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Meal Type */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Meal Type</Text>
                            <View style={styles.optionsGrid}>
                                {mealTypeOptions.map((option) => (
                                    <Pressable
                                        key={option.key}
                                        onPress={() => setMealType(option.key)}
                                        style={[
                                            styles.gridOption,
                                            mealType === option.key && styles.gridOptionActive,
                                        ]}
                                    >
                                        <Text style={styles.gridOptionEmoji}>{option.emoji}</Text>
                                        <Text
                                            style={[
                                                styles.gridOptionLabel,
                                                mealType === option.key && styles.gridOptionLabelActive,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                        <Pressable onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable onPress={handleGenerate} style={styles.generateButton}>
                            <Text style={styles.generateButtonText}>✨ Generate Recipe</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    modalTitle: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: colors.textSecondary,
    },
    form: {
        paddingHorizontal: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    sectionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    optionCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 2,
        borderColor: colors.surfaceElevated,
        alignItems: 'center',
    },
    optionCardActive: {
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.accent,
    },
    optionEmoji: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    optionLabel: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    optionLabelActive: {
        color: colors.textPrimary,
    },
    optionDescription: {
        ...typography.caption,
        color: colors.textMuted,
        textAlign: 'center',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    gridOption: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.surfaceElevated,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    gridOptionActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    gridOptionEmoji: {
        fontSize: 18,
    },
    gridOptionLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    gridOptionLabelActive: {
        color: colors.textInverse,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    cancelButtonText: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    generateButton: {
        flex: 2,
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    generateButtonText: {
        ...typography.body,
        color: colors.textInverse,
        fontWeight: '600',
    },
});
