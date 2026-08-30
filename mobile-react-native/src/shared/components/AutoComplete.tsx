import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard
} from 'react-native';

export interface AutoCompleteOption {
    id: number;
    label: string;
}

interface AutoCompleteProps {
    label?: string;
    placeholder?: string;
    value: AutoCompleteOption | null;
    onChange: (option: AutoCompleteOption | null) => void;
    fetchOptions: (query: string) => Promise<AutoCompleteOption[]>;
    minChars?: number;
    disabled?: boolean;
    style?: any;
}

export function AutoComplete({
                                 label,
                                 placeholder = 'Digite para buscar...',
                                 value,
                                 onChange,
                                 fetchOptions,
                                 minChars = 2,
                                 disabled = false,
                                 style,
                             }: AutoCompleteProps) {
    const [text, setText] = useState(value?.label ?? '');
    const [options, setOptions] = useState<AutoCompleteOption[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const rootRef = useRef<View>(null);
    const inputRef = useRef<TextInput>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setText(value?.label ?? '');
    }, [value]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const pesquisar = (termo: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const termoLimpo = termo.trim();
        if (termoLimpo.length < minChars) {
            setOptions([]);
            setOpen(false);
            return;
        }
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const resultado = await fetchOptions(termoLimpo);
                setOptions(resultado);
                setOpen(resultado.length > 0);
                setHighlighted(resultado.length > 0 ? 0 : -1);
            } catch {
                setOptions([]);
                setOpen(false);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const selecionar = (option: AutoCompleteOption) => {
        onChange(option);
        setText(option.label);
        setOpen(false);
        setHighlighted(-1);
        inputRef.current?.blur();
    };

    const limpar = () => {
        onChange(null);
        setText('');
        setOptions([]);
        setOpen(false);
        setHighlighted(-1);
        inputRef.current?.focus();
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputWrap}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={text}
                    placeholder={placeholder}
                    editable={!disabled}
                    onChangeText={(value) => {
                        setText(value);
                        onChange(null);
                        setHighlighted(-1);
                        pesquisar(value);
                    }}
                    onFocus={() => {
                        if (text.trim().length >= minChars) pesquisar(text);
                    }}
                    onBlur={() => {
                        setTimeout(() => setOpen(false), 200);
                    }}
                />
                {value && (
                    <TouchableOpacity style={styles.btnClear} onPress={limpar} accessibilityLabel="Limpar">
                        <Text style={styles.btnClearText}>✕</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.btnDropdown} onPress={() => {
                    if (text.trim().length >= minChars) pesquisar(text);
                    inputRef.current?.focus();
                }} disabled={disabled} accessibilityLabel="Listar opções">
                    <Text style={styles.btnDropdownText}>▾</Text>
                </TouchableOpacity>
            </View>
            {open && (
                <View style={styles.dropdown}>
                    <ScrollView
                        style={styles.dropdownList}
                        contentContainerStyle={styles.dropdownContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {loading && <Text style={styles.dropdownItem}>Buscando...</Text>}
                        {!loading && options.length === 0 && (
                            <Text style={[styles.dropdownItem, styles.dropdownEmpty]}>Nenhum registro encontrado.</Text>
                        )}
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.dropdownItem,
                                    index === highlighted && styles.dropdownItemActive,
                                ]}
                                onPress={() => selecionar(option)}
                            >
                                <Text style={styles.dropdownItemText}>{option.label || `#${option.id}`}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        color: '#555',
        marginBottom: 4,
        fontWeight: '500',
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
    },
    btnClear: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    btnClearText: {
        fontSize: 16,
        color: '#999',
    },
    btnDropdown: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderLeftWidth: 1,
        borderLeftColor: '#e0e0e0',
    },
    btnDropdownText: {
        fontSize: 16,
        color: '#666',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderTopWidth: 0,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
        maxHeight: 250,
    },
    dropdownList: {
        maxHeight: 250,
    },
    dropdownContent: {
        paddingVertical: 4,
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dropdownItemActive: {
        backgroundColor: '#e8f0fe',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownEmpty: {
        color: '#999',
        textAlign: 'center',
    },
});