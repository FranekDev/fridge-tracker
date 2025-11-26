export const colors = {
    // Primary palette - Deep teal with warm accents
    primary: '#0D4F4F',
    primaryLight: '#1A7575',
    primaryDark: '#083333',

    // Accent - Warm coral for contrast
    accent: '#FF6B4A',
    accentLight: '#FF8F75',
    accentDark: '#E54D2E',

    // Background layers
    background: '#0A0F0F',
    surface: '#141C1C',
    surfaceElevated: '#1C2626',
    surfaceHighlight: '#243030',

    // Text hierarchy
    textPrimary: '#F5F7F7',
    textSecondary: '#A8B5B5',
    textMuted: '#6B7C7C',
    textInverse: '#0A0F0F',

    // Semantic colors
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Category colors
    categories: {
        dairy: '#60A5FA',
        meat: '#F87171',
        vegetables: '#4ADE80',
        fruits: '#FBBF24',
        beverages: '#A78BFA',
        bakery: '#FB923C',
        frozen: '#22D3EE',
        snacks: '#F472B6',
        condiments: '#84CC16',
        other: '#94A3B8',
    } as const,
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
    },
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
    },
    label: {
        fontSize: 11,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
};
