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

export interface FormFieldAction {
    label: string;
    disabled?: boolean;
    onPress: (helpers: {value: unknown; setValue: (name: string, value: unknown) => void; values: Record<string, unknown>}) => void | Promise<void>;
}

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
    full?: boolean;
    actions?: FormFieldAction[];
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

        const hasActions = !!field.actions && field.actions.length > 0;

        const renderControl = () => (
            <View style={styles.fieldControl}>
                {field.type === 'select' ? (
                    <View style={styles.selectContainer}>
                        <TextInput
                            {...getInputProps()}
                            style={[styles.fieldInput, styles.selectInput]}
                            editable={false}
                        />
                        <Text style={styles.selectArrow}>▾</Text>
                    </View>
                ) : (
                    <TextInput {...getInputProps()} />
                )}
                {fieldError && <Text style={styles.fieldError}>{fieldError}</Text>}
            </View>
        );

        const renderControlWithActions = () => (
            <View style={styles.fieldControl}>
                <View style={styles.actionRow}>
                    <View style={styles.actionRowInput}>
                        {field.type === 'select' ? (
                            <View style={styles.selectContainer}>
                                <TextInput
                                    {...getInputProps()}
                                    style={[styles.fieldInput, styles.selectInput]}
                                    editable={false}
                                />
                                <Text style={styles.selectArrow}>▾</Text>
                            </View>
                        ) : (
                            <TextInput {...getInputProps()} />
                        )}
                    </View>
                    {field.actions!.map((action, idx) => (
                        <Pressable
                            key={`${action.label}-${idx}`}
                            style={[styles.actionButton, action.disabled && styles.actionButtonDisabled]}
                            disabled={action.disabled}
                            onPress={() => action.onPress({value: currentValue, setValue: (name, value) => handleChange(name, value), values})}
                        >
                            <Text style={styles.actionButtonText}>{action.label}</Text>
                        </Pressable>
                    ))}
                </View>
                {fieldError && <Text style={styles.fieldError}>{fieldError}</Text>}
            </View>
        );

        return (
            <View key={field.name} style={[styles.fieldContainer, (field.type === 'textarea' || field.full) && styles.fieldFull]}>
                <Text style={styles.fieldLabel}>
                    {field.label} {field.required && <Text style={styles.requiredStar}>*</Text>}
                </Text>
                {hasActions ? renderControlWithActions() : renderControl()}
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        justifyContent: 'space-between',
    },
    fieldContainer: {
        width: '48%',
        gap: Spacing.xs,
    },
    fieldFull: {
        width: '100%',
    },
    fieldLabel: {
        alignSelf: 'flex-start',
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    fieldControl: {
        flex: 1,
        gap: Spacing.xs,
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
    actionRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        alignItems: 'center',
    },
    actionRowInput: {
        flex: 1,
    },
    actionButton: {
        height: 44,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
    },
    actionButtonDisabled: {
        opacity: 0.5,
    },
    actionButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
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