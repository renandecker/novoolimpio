import React, {useState, useCallback} from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from './theme';

export interface FormFieldConfig {
    name: string;
    label: string;
    type?: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'mask' | 'autoComplete';
    required?: boolean;
    placeholder?: string;
    mask?: string;
    options?: Array<{value: string; label: string}>;
    readOnly?: boolean;
    autoCompleteSource?: string;
    autoCompleteSearchKeys?: string[];
    autoCompleteColumns?: any[];
}

export interface FormTabConfig {
    key: string;
    label: string;
    fields: FormFieldConfig[];
}

export interface FormLayoutProps {
    title: string;
    tabs: FormTabConfig[];
    initialValues?: Record<string, unknown>;
    onSubmit: (values: Record<string, unknown>) => void;
    onCancel: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    saving?: boolean;
    error?: string;
    style?: any;
}

export function FormLayout({
    title,
    tabs,
    initialValues = {},
    onSubmit,
    onCancel,
    submitLabel = 'Salvar',
    cancelLabel = 'Voltar',
    saving = false,
    error,
    style,
}: FormLayoutProps) {
    const [values, setValues] = useState<Record<string, unknown>>(initialValues);
    const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = useCallback((name: string, value: unknown) => {
        setValues((prev) => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors((prev) => {
                const next = {...prev};
                delete next[name];
                return next;
            });
        }
    }, [errors]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        tabs.forEach((tab) => {
            tab.fields.forEach((field) => {
                if (field.required) {
                    const val = values[field.name];
                    if (val === undefined || val === null || String(val).trim() === '') {
                        newErrors[field.name] = `${field.label} é obrigatório`;
                    }
                }
            });
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSubmit(values);
        }
    };

    const renderField = (field: FormFieldConfig) => {
        const fieldError = errors[field.name];
        const currentValue = values[field.name] ?? '';

        const getInputProps = () => ({
            style: [styles.fieldInput, fieldError && styles.fieldInputError],
            value: String(currentValue),
            onChangeText: (text: string) => handleChange(field.name, text),
            editable: !field.readOnly,
            placeholder: field.placeholder,
            multiline: field.type === 'textarea',
            numberOfLines: field.type === 'textarea' ? 4 : 1,
            keyboardType: field.type === 'number' ? 'numeric' : field.type === 'email' ? 'email-address' : 'default',
        });

        return (
            <View key={field.name} style={styles.fieldContainer}>
                <View style={styles.fieldLabelContainer}>
                    <Text style={styles.fieldLabel}>
                        {field.label} {field.required && <Text style={styles.requiredStar}>*</Text>}
                    </Text>
                </View>
                {field.type === 'select' ? (
                    <View style={styles.selectContainer}>
                        <TextInput
                            {...getInputProps()}
                            style={[styles.fieldInput, styles.selectInput]}
                            editable={false}
                        />
                        <Text style={styles.selectArrow}>▾</Text>
                    </View>
                ) : field.type === 'textarea' ? (
                    <TextInput {...getInputProps()} />
                ) : (
                    <TextInput {...getInputProps()} />
                )}
                {fieldError && <Text style={styles.fieldError}>{fieldError}</Text>}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, style]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>

            {error && <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>}

            <View style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <Pressable
                        key={tab.key}
                        style={[
                            styles.tabButton,
                            activeTab === tab.key && styles.tabButtonActive,
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[
                            styles.tabButtonText,
                            activeTab === tab.key && styles.tabButtonTextActive,
                        ]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentPadding}>
                {tabs
                    .filter((tab) => tab.key === activeTab)
                    .map((tab) => (
                        <View key={tab.key} style={styles.tabContent}>
                            {tab.fields.map(renderField)}
                        </View>
                    ))}
            </ScrollView>

            <View style={styles.footer}>
                <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel} disabled={saving}>
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>{cancelLabel}</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.saveButton]} onPress={handleSubmit} disabled={saving}>
                    <Text style={[styles.buttonText, styles.saveButtonText]}>
                        {saving ? 'Salvando...' : submitLabel}
                    </Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    header: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        backgroundColor: Colors.bgSecondary,
    },
    headerTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    errorContainer: {
        backgroundColor: Colors.warningBg,
        borderWidth: 1,
        borderColor: Colors.goldBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        margin: Spacing.lg,
    },
    errorText: {
        color: Colors.goldText,
        fontSize: Typography.sizes.md,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.bgSecondary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        paddingHorizontal: Spacing.lg,
    },
    tabButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        marginBottom: -1,
    },
    tabButtonActive: {
        borderBottomColor: Colors.primary,
        backgroundColor: Colors.bgPrimary,
    },
    tabButtonText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
    },
    tabButtonTextActive: {
        color: Colors.primary,
        fontWeight: Typography.weights.bold,
    },
    contentContainer: {
        flex: 1,
    },
    contentPadding: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    tabContent: {
        gap: Spacing.md,
    },
    fieldContainer: {
        gap: Spacing.xs,
    },
    fieldLabelContainer: {},
    fieldLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
        flexDirection: 'row',
        alignItems: 'center',
    },
    requiredStar: {
        color: Colors.danger,
        marginLeft: 2,
    },
    fieldInput: {
        height: 44,
        borderWidth: 1,
        borderColor: Colors.borderMedium,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.sizes.md,
        color: Colors.textPrimary,
        backgroundColor: Colors.bgPrimary,
    },
    fieldInputError: {
        borderColor: Colors.danger,
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    selectInput: {
        flex: 1,
        paddingRight: 36,
    },
    selectArrow: {
        position: 'absolute',
        right: 12,
        fontSize: 12,
        color: Colors.textLight,
        pointerEvents: 'none',
    },
    fieldError: {
        fontSize: Typography.sizes.xs,
        color: Colors.danger,
        marginTop: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: Spacing.lg,
        gap: Spacing.md,
        backgroundColor: Colors.bgSecondary,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        ...Shadows.card,
    },
    button: {
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.gold,
    },
    cancelButton: {
        backgroundColor: Colors.warning,
    },
    cancelButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    saveButton: {
        backgroundColor: Colors.primary,
    },
    saveButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
});