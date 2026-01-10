import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import { Product, ProductCategory } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { CrossPlatformDatePicker } from './CrossPlatformDatePicker';

interface EditProductModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (productId: string, updates: Partial<Omit<Product, 'id' | 'addedAt'>>) => void;
    onDelete: (productId: string) => void;
}

const categoryOptions: { key: ProductCategory; label: string; emoji: string }[] = [
    { key: 'dairy', label: 'Dairy', emoji: '🥛' },
    { key: 'meat', label: 'Meat', emoji: '🥩' },
    { key: 'vegetables', label: 'Vegetables', emoji: '🥬' },
    { key: 'fruits', label: 'Fruits', emoji: '🍎' },
    { key: 'beverages', label: 'Beverages', emoji: '🧃' },
    { key: 'bakery', label: 'Bakery', emoji: '🍞' },
    { key: 'frozen', label: 'Frozen', emoji: '🧊' },
    { key: 'snacks', label: 'Snacks', emoji: '🍿' },
    { key: 'condiments', label: 'Condiments', emoji: '🧂' },
    { key: 'other', label: 'Other', emoji: '📦' },
];

const unitOptions = ['pcs', 'kg', 'g', 'l', 'ml', 'pack'];

export function EditProductModal({ visible, product, onClose, onSave, onDelete }: EditProductModalProps) {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState('pcs');
    const [category, setCategory] = useState<ProductCategory>('other');
    const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (product) {
            setName(product.name);
            setQuantity(product.quantity.toString());
            setUnit(product.unit);
            setCategory(product.category);
            setExpiresAt(product.expiresAt);
        }
    }, [product]);

    const handleSave = () => {
        if (!product || !name.trim()) {
            return;
        }

        const updates: Partial<Omit<Product, 'id' | 'addedAt'>> = {
            name: name.trim(),
            quantity: parseFloat(quantity) || 1,
            unit,
            category,
            expiresAt,
        };

        onSave(product.id, updates);
        onClose();
    };

    const handleDelete = () => {
        if (!product) return;

        Alert.alert(
            'Usuń produkt',
            `Czy na pewno chcesz usunąć "${product.name}"?`,
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Usuń',
                    style: 'destructive',
                    onPress: () => {
                        onDelete(product.id);
                        onClose();
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        onClose();
    };

    if (!product) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edytuj produkt</Text>
                        <Pressable onPress={handleCancel} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        {/* Product Name */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Nazwa produktu *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="np. Mleko, Jabłka, Kurczak"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        {/* Quantity and Unit */}
                        <View style={styles.rowContainer}>
                            <View style={[styles.fieldContainer, styles.quantityField]}>
                                <Text style={styles.label}>Ilość *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="decimal-pad"
                                    placeholder="1"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={[styles.fieldContainer, styles.unitField]}>
                                <Text style={styles.label}>Jednostka</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.unitScroll}
                                >
                                    {unitOptions.map((u) => (
                                        <Pressable
                                            key={u}
                                            onPress={() => setUnit(u)}
                                            style={[
                                                styles.unitButton,
                                                unit === u && styles.unitButtonActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.unitButtonText,
                                                    unit === u && styles.unitButtonTextActive,
                                                ]}
                                            >
                                                {u}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Category */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Kategoria</Text>
                            <View style={styles.categoryGrid}>
                                {categoryOptions.map((cat) => (
                                    <Pressable
                                        key={cat.key}
                                        onPress={() => setCategory(cat.key)}
                                        style={[
                                            styles.categoryButton,
                                            category === cat.key && styles.categoryButtonActive,
                                        ]}
                                    >
                                        <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                        <Text
                                            style={[
                                                styles.categoryLabel,
                                                category === cat.key && styles.categoryLabelActive,
                                            ]}
                                        >
                                            {cat.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Expiry Date */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Termin przydatności (opcjonalnie)</Text>
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                style={styles.dateButton}
                            >
                                <Text style={styles.dateButtonText}>
                                    {expiresAt
                                        ? expiresAt.toLocaleDateString('pl-PL')
                                        : 'Wybierz termin przydatności'}
                                </Text>
                            </Pressable>
                            {expiresAt && (
                                <Pressable
                                    onPress={() => setExpiresAt(undefined)}
                                    style={styles.clearDateButton}
                                >
                                    <Text style={styles.clearDateButtonText}>Usuń datę</Text>
                                </Pressable>
                            )}
                        </View>

                        {showDatePicker && (
                            <View style={styles.datePickerContainer}>
                                <CrossPlatformDatePicker
                                    value={expiresAt || new Date()}
                                    onChange={(date) => {
                                        if (Platform.OS === 'web') {
                                            setExpiresAt(date);
                                        } else {
                                            setShowDatePicker(Platform.OS === 'ios');
                                            setExpiresAt(date);
                                        }
                                    }}
                                    minimumDate={new Date()}
                                />
                                {Platform.OS === 'ios' && (
                                    <Pressable
                                        onPress={() => setShowDatePicker(false)}
                                        style={styles.datePickerDone}
                                    >
                                        <Text style={styles.datePickerDoneText}>Gotowe</Text>
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                        <Pressable onPress={handleDelete} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>🗑️ Usuń</Text>
                        </Pressable>
                        <View style={styles.rightButtons}>
                            <Pressable onPress={handleCancel} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Anuluj</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSave}
                                style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
                                disabled={!name.trim()}
                            >
                                <Text style={styles.saveButtonText}>Zapisz</Text>
                            </Pressable>
                        </View>
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
    fieldContainer: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...typography.body,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.surfaceElevated,
    },
    rowContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    quantityField: {
        flex: 1,
    },
    unitField: {
        flex: 2,
    },
    unitScroll: {
        marginTop: spacing.xs,
    },
    unitButton: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        marginRight: spacing.xs,
        borderWidth: 1,
        borderColor: colors.surfaceElevated,
    },
    unitButtonActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    unitButtonText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    unitButtonTextActive: {
        color: colors.textInverse,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    categoryButton: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.surfaceElevated,
    },
    categoryButtonActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    categoryEmoji: {
        fontSize: 16,
    },
    categoryLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    categoryLabelActive: {
        color: colors.textInverse,
    },
    dateButton: {
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    dateButtonText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    clearDateButton: {
        marginTop: spacing.xs,
        alignSelf: 'flex-start',
    },
    clearDateButtonText: {
        ...typography.bodySmall,
        color: colors.error,
        fontWeight: '500',
    },
    datePickerContainer: {
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.sm,
        alignItems: 'center',
    },
    datePickerDone: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        minWidth: 100,
        alignItems: 'center',
    },
    datePickerDoneText: {
        ...typography.body,
        color: colors.textInverse,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    deleteButton: {
        backgroundColor: colors.surface,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.error,
    },
    deleteButtonText: {
        ...typography.body,
        color: colors.error,
        fontWeight: '600',
    },
    rightButtons: {
        flex: 1,
        flexDirection: 'row',
        gap: spacing.sm,
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
    saveButton: {
        flex: 1,
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    saveButtonDisabled: {
        backgroundColor: colors.surfaceElevated,
        opacity: 0.5,
    },
    saveButtonText: {
        ...typography.body,
        color: colors.textInverse,
        fontWeight: '600',
    },
});
