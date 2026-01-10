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
    { key: 'short' as const, label: 'Krótkie (<20 min)', emoji: '⚡' },
    { key: 'medium' as const, label: 'Średnie (20-40 min)', emoji: '⏱️' },
    { key: 'long' as const, label: 'Długie (>40 min)', emoji: '🕐' },
    { key: 'any' as const, label: 'Nieistotne', emoji: '🤷' },
];

const mealTypeOptions = [
    { key: 'breakfast' as const, label: 'Śniadanie', emoji: '🍳' },
    { key: 'lunch' as const, label: 'Obiad', emoji: '🍽️' },
    { key: 'dinner' as const, label: 'Kolacja', emoji: '🌙' },
    { key: 'snack' as const, label: 'Przekąska', emoji: '🍿' },
    { key: 'beverage' as const, label: 'Napój', emoji: '🥤' },
    { key: 'any' as const, label: 'Nieistotne', emoji: '✨' },
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
                        <Text style={styles.modalTitle}>Preferencje przepisu</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        {/* Priority Type */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Priorytet produktów</Text>
                            <Text style={styles.sectionDescription}>
                                Jak mają być dobierane produkty do przepisu?
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
                                        Krótki termin ważności
                                    </Text>
                                    <Text style={styles.optionDescription}>
                                        Użyj produktów, które niedługo stracą ważność
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
                                        Dowolne
                                    </Text>
                                    <Text style={styles.optionDescription}>
                                        Dowolne produkty z lodówki
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Prep Time */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Czas przygotowania</Text>
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
                            <Text style={styles.sectionTitle}>Przeznaczenie</Text>
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
                            <Text style={styles.cancelButtonText}>Anuluj</Text>
                        </Pressable>
                        <Pressable onPress={handleGenerate} style={styles.generateButton}>
                            <Text style={styles.generateButtonText}>✨ Generuj przepisy</Text>
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
