import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

export function SettingsScreen() {
    const { user, signOut } = useAuth();

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await signOut();
                        if (error) {
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Settings</Text>
                        <Text style={styles.subtitle}>Manage your account</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Text style={styles.headerIcon}>⚙️</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {/* User Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.card}>
                        <View style={styles.cardColumn}>
                            <Text style={styles.cardLabel}>Email</Text>
                            <Text style={styles.cardValue} numberOfLines={1} ellipsizeMode="tail">
                                {user?.email || 'Brak'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <Pressable
                        style={styles.logoutButton}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>
                </View>

                {/* App Info */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Fridge Tracker v1.0.0</Text>
                    <Text style={styles.footerTextSmall}>
                        Manage your fridge smartly
                    </Text>
                </View>
            </View>
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
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        ...shadows.sm,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardColumn: {
        flexDirection: 'column',
        gap: spacing.sm,
    },
    cardLabel: {
        ...typography.body,
        color: colors.textSecondary,
    },
    cardValue: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.error,
        ...shadows.sm,
    },
    logoutIcon: {
        fontSize: 24,
    },
    logoutText: {
        ...typography.body,
        color: colors.error,
        fontWeight: '600',
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: spacing.xl,
    },
    footerText: {
        ...typography.bodySmall,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    footerTextSmall: {
        ...typography.caption,
        color: colors.textMuted,
    },
});
