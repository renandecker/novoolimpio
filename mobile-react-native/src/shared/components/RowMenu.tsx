import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../styles/theme';

export interface RowMenuItem {
    key: string;
    label: string;
    className?: string;
    disabled?: boolean;
    onSelect?: () => void;
}

interface RowMenuProps {
    icon: React.ReactNode;
    className: string;
    title?: string;
    items: RowMenuItem[];
    triggerStyle?: any;
}

const CLASS_COLORS: Record<string, string> = {
    btnblue: Colors.primary,
    btngreen: Colors.success,
    btnred: Colors.error,
    btnyellow: Colors.goldBg,
    btnorange: '#FF9800',
    btnpurple: '#9C27B0',
    btnpink: '#E91E63',
    btnbrown: '#795548',
    btnblack: '#333',
    btnsky: '#00BCD4',
    btnstop: '#FF5722',
    btngrey: '#9E9E9E',
};

export function RowMenu({icon, className, title, items, triggerStyle}: RowMenuProps) {
    const [open, setOpen] = useState(false);

    if (items.length === 0) return null;

    const bgColor = CLASS_COLORS[className] || Colors.primary;

    return (
        <View style={[styles.container, triggerStyle]}>
            <TouchableOpacity
                style={[styles.trigger, {backgroundColor: bgColor}]}
                onPress={() => setOpen(!open)}
                activeOpacity={0.8}
                accessibilityLabel={title || 'Ações'}
            >
                {icon}
            </TouchableOpacity>
            <Modal
                visible={open}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setOpen(false)}
            >
                <TouchableOpacity style={styles.overlay} onPress={() => setOpen(false)} accessible={false} activeOpacity={1}>
                    <View style={styles.dropdown}>
                        {title && (
                            <View style={styles.dropdownHeader}>
                                <Text style={styles.dropdownTitle}>{title}</Text>
                            </View>
                        )}
                        {items.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={styles.item}
                                disabled={item.disabled}
                                onPress={() => {
                                    setOpen(false);
                                    item.onSelect?.();
                                }}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.itemText,
                                        item.className && {color: CLASS_COLORS[item.className] || Colors.textPrimary},
                                        item.disabled && styles.itemTextDisabled,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    trigger: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.small,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
    },
    dropdown: {
        width: 220,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        ...Shadows.medium,
        overflow: 'hidden',
        marginTop: 40,
        marginRight: 16,
        maxHeight: 300,
    },
    dropdownHeader: {
        padding: Spacing.md,
        backgroundColor: Colors.headerStart,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderGold,
    },
    dropdownTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textWhite,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    itemText: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
    },
    itemTextDisabled: {
        opacity: 0.4,
    },
});