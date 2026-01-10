import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, typography } from '../theme';

interface CrossPlatformDatePickerProps {
    value: Date;
    onChange: (date: Date | undefined) => void;
    minimumDate?: Date;
}

export function CrossPlatformDatePicker({ value, onChange, minimumDate }: CrossPlatformDatePickerProps) {
    if (Platform.OS === 'web') {
        // Dla web używamy natywnego HTML input type="date"
        const formatDateForInput = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const handleWebDateChange = (e: any) => {
            const dateString = e.target.value;
            if (dateString) {
                // Parsowanie daty w formacie YYYY-MM-DD
                const [year, month, day] = dateString.split('-').map(Number);
                if (year && month && day && !isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    const newDate = new Date(year, month - 1, day);
                    if (!isNaN(newDate.getTime())) {
                        onChange(newDate);
                    }
                }
            }
        };

        const minDateString = minimumDate ? formatDateForInput(minimumDate) : undefined;

        // Renderujemy natywny HTML input dla web
        return (
            <View style={styles.webDatePickerContainer}>
                <input
                    type="date"
                    value={formatDateForInput(value)}
                    onChange={handleWebDateChange}
                    min={minDateString}
                    style={{
                        backgroundColor: colors.surfaceElevated,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        fontSize: 16,
                        color: colors.textPrimary,
                        borderWidth: 1,
                        borderColor: colors.surfaceHighlight,
                        borderStyle: 'solid',
                        width: '100%',
                        colorScheme: 'dark',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        outline: 'none',
                    }}
                />
            </View>
        );
    }

    // Dla iOS i Android używamy DateTimePicker
    return (
        <DateTimePicker
            value={value}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={minimumDate}
            themeVariant="dark"
            textColor={colors.textPrimary}
            onChange={(event, selectedDate) => {
                if (selectedDate) {
                    onChange(selectedDate);
                }
            }}
        />
    );
}

const styles = StyleSheet.create({
    webDatePickerContainer: {
        width: '100%',
    },
});
