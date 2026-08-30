import {Pressable, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'danger' | 'success' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    style?: any;
}

const variantStyles: Record<ButtonVariant, {bg: string; color: string; border: string; activeBg: string}> = {
    primary: {
        bg: Colors.primary,
        color: Colors.textWhite,
        border: Colors.primary,
        activeBg: Colors.primaryDark,
    },
    secondary: {
        bg: Colors.bgSecondary,
        color: Colors.textSecondary,
        border: Colors.borderMedium,
        activeBg: Colors.bgPrimary,
    },
    gold: {
        bg: Colors.gold,
        color: Colors.textWhite,
        border: Colors.gold,
        activeBg: Colors.goldDark,
    },
    danger: {
        bg: Colors.error,
        color: Colors.textWhite,
        border: Colors.error,
        activeBg: Colors.errorLight,
    },
    success: {
        bg: Colors.success,
        color: Colors.textWhite,
        border: Colors.success,
        activeBg: Colors.successLight,
    },
    outline: {
        bg: 'transparent',
        color: Colors.primary,
        border: Colors.primary,
        activeBg: Colors.primary + '15',
    },
    ghost: {
        bg: 'transparent',
        color: Colors.textSecondary,
        border: 'transparent',
        activeBg: Colors.bgPrimary,
    },
};

const sizeStyles: Record<ButtonSize, {px: number; py: number; fontSize: number; iconSize: number; gap: number}> = {
    sm: {px: Spacing.md, py: Spacing.xs, fontSize: Typography.sizes.sm, iconSize: 14, gap: Spacing.xs},
    md: {px: Spacing.lg, py: Spacing.sm, fontSize: Typography.sizes.base, iconSize: 16, gap: Spacing.sm},
    lg: {px: Spacing.xl, py: Spacing.md, fontSize: Typography.sizes.lg, iconSize: 18, gap: Spacing.md},
};

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    style,
}: ButtonProps) {
    const v = variantStyles[variant];
    const s = sizeStyles[size];

    const isDisabled = disabled || loading;

    return (
        <Pressable
            style={[
                styles.container,
                fullWidth && styles.fullWidth,
                {
                    backgroundColor: isDisabled ? Colors.borderLight : v.bg,
                    borderColor: v.border,
                },
                style,
            ]}
            onPress={isDisabled ? undefined : onPress}
            android_ripple={{color: v.activeBg}}
        >
            {loading ? (
                <ActivityIndicator color={v.color} size="small"/>
            ) : (
                <View style={[styles.content, {gap: s.gap}]}>
                    {leftIcon}
                    <Text style={[
                        styles.text,
                        {color: isDisabled ? Colors.textLight : v.color, fontSize: s.fontSize, fontWeight: Typography.weights.semibold},
                    ]}>
                        {title}
                    </Text>
                    {rightIcon}
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        ...Shadows.small,
    },
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontFamily: Typography.fontFamily,
    },
});

export function IconButton({
    icon,
    onPress,
    variant = 'ghost',
    size = 'md',
    disabled = false,
    style,
}: {
    icon: React.ReactNode;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    style?: any;
}) {
    const v = variantStyles[variant];
    const s = sizeStyles[size];

    return (
        <Pressable
            style={[
                styles.iconContainer,
                {
                    backgroundColor: disabled ? Colors.borderLight : v.bg,
                    borderColor: v.border,
                },
                style,
            ]}
            onPress={disabled ? undefined : onPress}
            android_ripple={{color: v.activeBg}}
        >
            {icon}
        </Pressable>
    );
}

const iconStyles = StyleSheet.create({
    iconContainer: {
        borderRadius: BorderRadius.round,
        borderWidth: 1,
        padding: Spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
});