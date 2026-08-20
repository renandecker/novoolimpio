import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from './api';
import type {ApiItem} from './types';

export interface MasterDetailColumn {
    key: string;
    label: string;
}

interface MasterDetailProps {
    label: string;
    source: string;
    valueKey?: string;
    searchKeys?: string[];
    columns?: MasterDetailColumn[];
    items: ApiItem[];
    onChange: (items: ApiItem[]) => void;
}

const toTitle = (value: string) =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase());

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const fkBase = (key: string): string | null => (key.startsWith('id_') ? key.slice(3) : null);

const renderValue = (item: ApiItem, key: string): string => {
    const base = fkBase(key);
    if (base) {
        const description = asRecord(item)[`${base}_descricao`];
        if (description !== null && description !== undefined) return String(description);
    }
    const value = asRecord(item)[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        for (const subKey of ['descricao', 'nome', 'rotulo', 'sucinto', 'razaoSocial']) {
            const sub = record[subKey];
            if (typeof sub === 'string' && sub) return sub;
        }
        const flat: string[] = [];
        for (const subKey of Object.keys(record)) {
            const sub = record[subKey];
            if (sub === null || sub === undefined) continue;
            if (typeof sub === 'string' && sub) flat.push(sub);
        }
        return flat.join(' - ');
    }
    return String(value);
};

const deriveColumns = (item: ApiItem): MasterDetailColumn[] => {
    const record = asRecord(item);
    const consumed = new Set<string>();
    for (const key of Object.keys(record)) {
        const base = fkBase(key);
        if (base && record[`${base}_descricao`] !== undefined) consumed.add(`${base}_descricao`);
    }
    return Object.keys(record)
        .filter((key) => key !== 'id' && key !== 'dadosJson' && !consumed.has(key))
        .map((key) => {
            const base = fkBase(key);
            const hasDescription = Boolean(base && record[`${base}_descricao`] !== undefined);
            return {key, label: hasDescription && base ? toTitle(base) : toTitle(key)};
        });
};

export function MasterDetail({
                                 label,
                                 source,
                                 valueKey = 'id',
                                 searchKeys,
                                 columns,
                                 items,
                                 onChange,
                             }: MasterDetailProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<ApiItem | null>(null);

    const {data: all = []} = useQuery({
        queryKey: [source, 'master-detail'],
        queryFn: async () => (await api.get<ApiItem[]>(source)).data,
    });

    const detailCols: MasterDetailColumn[] =
        columns && columns.length > 0
            ? columns
            : items.length > 0
            ? deriveColumns(items[0])
            : [];

    const suggestions = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return [];
        const keys: string[] = searchKeys && searchKeys.length > 0 ? searchKeys : detailCols.map((c) => c.key);
        const existing = new Set(items.map((item) => String(asRecord(item)[valueKey])));
        return all.filter((item) => {
            if (existing.has(String(asRecord(item)[valueKey]))) return false;
            return keys.some((key) => String(asRecord(item)[key] ? ? '').toLowerCase().includes(term));
        });
    }, [query, all, items, searchKeys, detailCols, valueKey]);

    const addSelected = () => {
        if (!selected) return;
        const exists = items.some((item) => String(asRecord(item)[valueKey]) === String(asRecord(selected)[valueKey]));
        if (!exists) onChange([...items, selected]);
        setSelected(null);
        setQuery('');
        setOpen(false);
    };

    const addSuggestion = (item: ApiItem) => {
        setSelected(item);
        setQuery(detailCols.map((col) => renderValue(item, col.key)).filter(Boolean).join(' - '));
        setOpen(false);
    };

    const removeItem = (item: ApiItem) => {
        onChange(items.filter((i) => String(asRecord(i)[valueKey]) !== String(asRecord(item)[valueKey])));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <TextInput
                        style={styles.input}
                        value={query}
                        placeholder="Digite para buscar..."
                        onFocus={() => setOpen(true)}
                        onChangeText={(text) => {
                            setQuery(text);
                            setSelected(null);
                            setOpen(true);
                        }}
                    />
                    {open && suggestions.length > 0 && (
                        <View style={styles.suggestions}>
                            {suggestions.slice(0, 8).map((item) => (
                                <Pressable
                                    key={String(asRecord(item)[valueKey])}
                                    style={styles.suggestionItem}
                                    onPress={() => addSuggestion(item)}
                                >
                                    <Text style={styles.suggestionText}>
                                        {detailCols.map((col) => renderValue(item, col.key)).filter(Boolean).join(' - ') ||
                                        `#${String(asRecord(item)[valueKey])}`}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
                <Pressable
                    style={[styles.addButton, !selected && styles.addButtonDisabled]}
                    disabled={!selected}
                    onPress={addSelected}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </Pressable>
            </View>

            <View style={styles.list}>
                {items.length === 0 ? (
                    <Text style={styles.empty}>Nenhum registro selecionado.</Text>
                ) : (
                    <FlatList
                        data={items}
                        scrollEnabled={false}
                        keyExtractor={(item, index) => `${String(asRecord(item)[valueKey])}-${index}`}
                        renderItem={({item}) => (
                            <View style={styles.row}>
                                <View style={styles.rowText}>
                                    {detailCols.map((col) => (
                                        <Text key={col.key} style={styles.rowValue}>
                                            {col.label}: {renderValue(item, col.key)}
                                        </Text>
                                    ))}
                                </View>
                                <Pressable style={styles.removeButton} onPress={() => removeItem(item)}>
                                    <Text style={styles.removeButtonText}>−</Text>
                                </Pressable>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {marginBottom: 12},
    label: {fontSize: 14, fontWeight: '700', color: '#2b2b2b', marginBottom: 6},
    searchRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, zIndex: 10},
    searchBox: {flex: 1, position: 'relative'},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#ffffff',
    },
    suggestions: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        backgroundColor: '#ffffff',
        marginTop: 2,
    },
    suggestionItem: {paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee'},
    suggestionText: {fontSize: 13, color: '#2b2b2b'},
    addButton: {backgroundColor: '#2a5a88', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 9},
    addButtonDisabled: {opacity: 0.4},
    addButtonText: {color: '#ffffff', fontSize: 16, fontWeight: '700'},
    list: {marginTop: 10},
    empty: {color: '#888', fontStyle: 'italic', fontSize: 13},
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        padding: 8,
        marginBottom: 6,
        backgroundColor: '#fafafa',
    },
    rowText: {flex: 1},
    rowValue: {fontSize: 13, color: '#2b2b2b'},
    removeButton: {
        backgroundColor: '#a61b29',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginLeft: 8
    },
    removeButtonText: {color: '#ffffff', fontSize: 16, fontWeight: '700'},
});
