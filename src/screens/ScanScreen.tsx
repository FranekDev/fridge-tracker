import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Product } from '../types';
import { processReceipt } from '../api/mockApi';
import { ScannedProductsList } from '../components/ScannedProductsList';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface ScanScreenProps {
    onProductsScanned?: (products: Product[]) => void;
}

type ScreenState = 'idle' | 'preview' | 'scanning' | 'results';

export function ScanScreen({ onProductsScanned }: ScanScreenProps) {
    const [screenState, setScreenState] = useState<ScreenState>('idle');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [scanResult, setScanResult] = useState<{
        storeName?: string;
        totalAmount?: number;
    }>({});

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    // Start pulse animation for the scan button
    React.useEffect(() => {
        if (screenState === 'idle') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [screenState, pulseAnim]);

    // Bounce animation on results
    React.useEffect(() => {
        if (screenState === 'results') {
            Animated.spring(bounceAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }).start();
        } else {
            bounceAnim.setValue(0);
        }
    }, [screenState, bounceAnim]);

    const requestPermissions = async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo library to scan receipts.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            setScreenState('preview');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your camera to take photos of receipts.',
                [{ text: 'OK' }]
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            setScreenState('preview');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleScan = async () => {
        if (!imageUri) return;

        setScreenState('scanning');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const response = await processReceipt(imageUri);

            if (response.success && response.data.success) {
                setScannedProducts(response.data.products);
                setScanResult({
                    storeName: response.data.storeName,
                    totalAmount: response.data.totalAmount,
                });
                // Select all products by default
                setSelectedIds(new Set(response.data.products.map((p) => p.id)));
                setScreenState('results');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Alert.alert(
                    'Scan Failed',
                    response.error || 'Could not process the receipt. Please try again.',
                    [{ text: 'OK' }]
                );
                setScreenState('preview');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
            setScreenState('preview');
        }
    };

    const handleToggleProduct = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleAddSelected = () => {
        const selectedProducts = scannedProducts.filter((p) => selectedIds.has(p.id));
        onProductsScanned?.(selectedProducts);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        resetScan();
    };

    const resetScan = () => {
        setScreenState('idle');
        setImageUri(null);
        setScannedProducts([]);
        setSelectedIds(new Set());
        setScanResult({});
    };

    const renderIdleState = () => (
        <View style={styles.idleContainer}>
            <View style={styles.illustration}>
                <Text style={styles.illustrationEmoji}>🧾</Text>
                <View style={styles.illustrationGlow} />
            </View>

            <Text style={styles.title}>Scan Receipt</Text>
            <Text style={styles.description}>
                Take a photo or select an image of your grocery receipt to automatically add items to your
                fridge.
            </Text>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable style={styles.primaryButton} onPress={takePhoto}>
                    <Text style={styles.primaryButtonIcon}>📸</Text>
                    <Text style={styles.primaryButtonText}>Take Photo</Text>
                </Pressable>
            </Animated.View>

            <Pressable style={styles.secondaryButton} onPress={pickImage}>
                <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            </Pressable>
        </View>
    );

    const renderPreviewState = () => (
        <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
                <Pressable style={styles.backButton} onPress={resetScan}>
                    <Text style={styles.backButtonText}>← Cancel</Text>
                </Pressable>
                <Text style={styles.previewTitle}>Receipt Preview</Text>
                <View style={styles.spacer} />
            </View>

            {imageUri && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    <View style={styles.imageBorder} />
                </View>
            )}

            <View style={styles.previewActions}>
                <Pressable style={styles.retakeButton} onPress={pickImage}>
                    <Text style={styles.retakeButtonText}>Choose Different</Text>
                </Pressable>

                <Pressable style={styles.scanButton} onPress={handleScan}>
                    <Text style={styles.scanButtonIcon}>✨</Text>
                    <Text style={styles.scanButtonText}>Scan Receipt</Text>
                </Pressable>
            </View>
        </View>
    );

    const renderResultsState = () => (
        <Animated.View
            style={[
                styles.resultsContainer,
                {
                    opacity: bounceAnim,
                    transform: [
                        {
                            translateY: bounceAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <View style={styles.resultsHeader}>
                <Pressable style={styles.backButton} onPress={resetScan}>
                    <Text style={styles.backButtonText}>← New Scan</Text>
                </Pressable>
            </View>

            <ScannedProductsList
                products={scannedProducts}
                selectedIds={selectedIds}
                onToggleProduct={handleToggleProduct}
                onAddSelected={handleAddSelected}
                storeName={scanResult.storeName}
                totalAmount={scanResult.totalAmount}
            />
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {screenState === 'idle' && renderIdleState()}
            {screenState === 'preview' && renderPreviewState()}
            {screenState === 'results' && renderResultsState()}

            <LoadingOverlay visible={screenState === 'scanning'} message="Processing receipt..." />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    idleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    illustration: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        position: 'relative',
    },
    illustrationEmoji: {
        fontSize: 64,
    },
    illustrationGlow: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: colors.accent,
        opacity: 0.1,
        transform: [{ scale: 1.2 }],
    },
    title: {
        ...typography.h1,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    description: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 300,
        lineHeight: 24,
        marginBottom: spacing.xl,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md + 4,
        borderRadius: borderRadius.full,
        gap: spacing.sm,
        ...shadows.md,
    },
    primaryButtonIcon: {
        fontSize: 24,
    },
    primaryButtonText: {
        ...typography.h3,
        color: colors.textInverse,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        marginTop: spacing.md,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    secondaryButtonIcon: {
        fontSize: 20,
    },
    secondaryButtonText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    previewContainer: {
        flex: 1,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    backButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    backButtonText: {
        ...typography.body,
        color: colors.accent,
    },
    previewTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    spacer: {
        width: 80,
    },
    imageContainer: {
        flex: 1,
        margin: spacing.md,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        backgroundColor: colors.surface,
    },
    imageBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: colors.accent,
        borderRadius: borderRadius.xl,
        opacity: 0.5,
    },
    previewActions: {
        flexDirection: 'row',
        padding: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    retakeButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    retakeButtonText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    scanButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        ...shadows.md,
    },
    scanButtonIcon: {
        fontSize: 20,
    },
    scanButtonText: {
        ...typography.body,
        color: colors.textInverse,
        fontWeight: '600',
    },
    resultsContainer: {
        flex: 1,
    },
    resultsHeader: {
        padding: spacing.sm,
    },
});
