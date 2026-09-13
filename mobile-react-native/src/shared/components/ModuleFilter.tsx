import React, {useState} from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import type {SearchFilterRequest, FilterCondition, QueryOperation} from '../types';
import {STRING_OPERATIONS} from '../types';
import {BorderRadius, Colors, Shadows, Spacing, Typography} from '../theme';

const toTitle = (value: string) =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/^_/, '')
        .replace(/^./, (c) => c.toUpperCase());

export type ModuleFilterColumns = string[] | (() => string[]);

interface ModuleFilterProps {
    columns: ModuleFilterColumns;
    value: SearchFilterRequest;
    onChange: (filters: SearchFilterRequest) => void;
}

export function ModuleFilter({columns, value, onChange}: ModuleFilterProps) {
    const [visible, setVisible] = useState(false);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [ops, setOps] = useState<Record<string, QueryOperation>>({});
    const [values2, setValues2] = useState<Record<string, string>>({});

    const cols = typeof columns === 'function' ? columns() : columns;
    const effectiveCols = cols.filter((c) => c !== 'id' && c !== 'dadosJson');

    const open = () => {
        setInputs({});
        setOps({});
        setValues2({});
        setVisible(true);
    };

    const apply = () => {
        const filters: Record<string, FilterCondition> = {};
        for (const [key, v] of Object.entries(inputs)) {
            if (v !== null && v !== undefined && v !== '') {
                const op = ops[key] ?? 'CONTAINS';
                filters[key] = {
                    operation: op,
                    value: v,
                    value2: op === 'BETWEEN' ? (values2[key] ?? undefined) : undefined,
                };
            }
        }
        onChange({filters});
        setVisible(false);
    };

    const clear = () => {
        setInputs({});
        setOps({});
        setValues2({});
        onChange({filters: {}});
        setVisible(false);
    };

    const isNumberOp = (op: QueryOperation) =>
        ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'BETWEEN'].includes(op);

    return (
        <>
            <Pressable style={[styles.searchButton]} onPress={open}>
                <Text style={styles.searchButtonText}>Buscar</Text>
            </Pressable>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtros de Busca</Text>
                            <Pressable style={styles.closeBtn} onPress={() => setVisible(false)}>
                                <Text style={styles.closeText}>✕</Text>
                            </Pressable>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {effectiveCols.length === 0 ? (
                                <Text style={styles.empty}>Nenhum campo disponível para filtro.</Text>
                            ) : (
                                effectiveCols.map((field) => {
                                    const op = ops[field] ?? 'CONTAINS';
                                    return (
                                        <View key={field} style={styles.filterField}>
                                            <Text style={styles.fieldLabel}>{toTitle(field)}</Text>
                                            <View style={styles.filterOpWrap}>
                                                {STRING_OPERATIONS.map((o) => (
                                                    <Pressable
                                                        key={o.value}
                                                        style={[styles.filterOpBtn, op === o.value && styles.filterOpBtnActive]}
                                                        onPress={() => setOps((p) => ({...p, [field]: o.value}))}
                                                    >
                                                        <Text style={[styles.filterOpBtnText, op === o.value && styles.filterOpBtnTextActive]}>
                                                            {o.label}
                                                        </Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                            <TextInput
                                                style={styles.fieldInput}
                                                value={inputs[field] ?? ''}
                                                onChangeText={(t) => setInputs((p) => ({...p, [field]: t}))}
                                                placeholder={`Filtrar por ${toTitle(field)}`}
                                            />
                                            {op === 'BETWEEN' && (
                                                <View style={styles.filterBetweenRow}>
                                                    <Text style={styles.filterBetweenLabel}>até</Text>
                                                    <TextInput
                                                        style={[styles.fieldInput, {flex: 1}]}
                                                        value={values2[field] ?? ''}
                                                        onChangeText={(t) => setValues2((p) => ({...p, [field]: t}))}
                                                        placeholder="Valor final"
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            )}
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={[styles.modalButton, {backgroundColor: Colors.warningBg}]} onPress={clear}>
                                <Text style={styles.cancelButtonText}>Limpar</Text>
                            </Pressable>
                            <Pressable style={[styles.modalButton, styles.saveButton]} onPress={apply}>
                                <Text style={styles.modalButtonText}>Pesquisar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    searchButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        marginRight: Spacing.sm,
        ...Shadows.gold,
    },
    searchButtonText: {color: Colors.textWhite, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold},
    overlay: {flex: 1, backgroundColor: Colors.modalOverlay, justifyContent: 'center', padding: Spacing.lg},
    modalBox: {backgroundColor: Colors.bgSecondary, borderRadius: BorderRadius.xxl, maxHeight: '85%', ...Shadows.modal, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderGold},
    modalHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.headerStart, borderBottomWidth: 3, borderBottomColor: Colors.gold},
    modalTitle: {fontSize: Typography.sizes.xl, fontWeight: Typography.weights.semibold, color: Colors.textWhite},
    closeBtn: {width: 36, height: 36, borderRadius: BorderRadius.lg, backgroundColor: Colors.modalCloseBg, alignItems: 'center', justifyContent: 'center'},
    closeText: {color: Colors.modalCloseColor, fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.medium},
    modalScroll: {paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md},
    empty: {textAlign: 'center', color: Colors.textLight, marginTop: Spacing.xl, fontSize: Typography.sizes.lg},
    filterField: {marginBottom: Spacing.xl, backgroundColor: Colors.bgPrimary, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight},
    fieldLabel: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm},
    filterRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
    filterOpWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm, marginTop: Spacing.xs},
    filterOpBtn: {borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs},
    filterOpBtnActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
    filterOpBtnText: {fontSize: Typography.sizes.xs, color: Colors.textSecondary},
    filterOpBtnTextActive: {color: Colors.textWhite, fontWeight: Typography.weights.semibold},
    fieldInput: {flex: 1, borderWidth: 1, borderColor: Colors.formInputBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: Typography.sizes.lg, color: Colors.textPrimary, backgroundColor: Colors.bgSecondary},
    filterBetweenRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm},
    filterBetweenLabel: {fontSize: Typography.sizes.base, color: Colors.textMuted},
    modalActions: {flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight},
    modalButton: {borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md},
    cancelButton: {backgroundColor: Colors.bgPrimary, borderWidth: 1, borderColor: Colors.borderMedium},
    cancelButtonText: {color: Colors.textSecondary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold},
    saveButton: {backgroundColor: Colors.primary, ...Shadows.gold},
    modalButtonText: {color: Colors.textWhite, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold},
});
