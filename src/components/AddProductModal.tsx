import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    Platform,
} from 'react-native';
import { Product, ProductCategory } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { CrossPlatformDatePicker } from './CrossPlatformDatePicker';

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (product: Omit<Product, 'id'>) => void;
}

const categoryOptions: { key: ProductCategory; label: string; emoji: string }[] = [
    { key: 'dairy', label: 'Dairy', emoji: '🥛' },
    { key: 'meat', label: 'Meat', emoji: '🥩' },
    { key: 'vegetables', label: 'Veggies', emoji: '🥬' },
    { key: 'fruits', label: 'Fruits', emoji: '🍎' },
    { key: 'beverages', label: 'Drinks', emoji: '🧃' },
    { key: 'bakery', label: 'Bakery', emoji: '🍞' },
    { key: 'frozen', label: 'Frozen', emoji: '🧊' },
    { key: 'other', label: 'Other', emoji: '📦' },
];

const unitOptions = ['pcs', 'kg', 'g', 'l', 'ml', 'pack'];

export function AddProductModal({ visible, onClose, onAdd }: AddProductModalProps) {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState('pcs');
    const [category, setCategory] = useState<ProductCategory>('other');
    const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const resetForm = () => {
        setName('');
        setQuantity('1');
        setUnit('pcs');
        setCategory('other');
        setExpiresAt(undefined);
    };

    const handleAdd = () => {
        if (!name.trim()) {
            return;
        }

        const product: Omit<Product, 'id'> = {
            name: name.trim(),
            quantity: parseFloat(quantity) || 1,
            unit,
            category,
            addedAt: new Date(),
            expiresAt,
        };

        onAdd(product);
        resetForm();
        onClose();
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

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
                        <Text style={styles.modalTitle}>Add Product Manually</Text>
                        <Pressable onPress={handleCancel} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        {/* Product Name */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Product Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g., Milk, Apples, Chicken"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        {/* Quantity and Unit */}
                        <View style={styles.rowContainer}>
                            <View style={[styles.fieldContainer, styles.quantityField]}>
                                <Text style={styles.label}>Quantity *</Text>
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
                                <Text style={styles.label}>Unit</Text>
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
                            <Text style={styles.label}>Category</Text>
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
                            <Text style={styles.label}>Expiry Date (Optional)</Text>
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                style={styles.dateButton}
                            >
                                <Text style={styles.dateButtonText}>
                                    {expiresAt
                                        ? expiresAt.toLocaleDateString()
                                        : 'Select expiry date'}
                                </Text>
                            </Pressable>
                            {expiresAt && (
                                <Pressable
                                    onPress={() => setExpiresAt(undefined)}
                                    style={styles.clearDateButton}
                                >
                                    <Text style={styles.clearDateButtonText}>Clear date</Text>
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
                                        <Text style={styles.datePickerDoneText}>Done</Text>
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                        <Pressable onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleAdd}
                            style={[styles.addButton, !name.trim() && styles.addButtonDisabled]}
                            disabled={!name.trim()}
                        >
                            <Text style={styles.addButtonText}>Add Product</Text>
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
    addButton: {
        flex: 1,
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    addButtonDisabled: {
        backgroundColor: colors.surfaceElevated,
        opacity: 0.5,
    },
    addButtonText: {
        ...typography.body,
        color: colors.textInverse,
        fontWeight: '600',
    },
});
