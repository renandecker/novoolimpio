import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    TextInput,
    FlatList,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../services/api';
import type {FiltroRelatorioWrapper, FilterDimensionType, TempoFilterState, DescritivoFilterState, FixoFilterState, FilterState, QueryOperation, ReportFilterSqlValues} from '../types/types';
import {STRING_OPERATIONS} from '../types/types';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../styles/theme';

const TEMPO_TYPES = [
    {value: 0, label: 'Nenhum'},
    {value: 1, label: 'Normal'},
    {value: 2, label: 'Dinâmico'},
    {value: 3, label: 'Faixa'},
];

const DYNAMIC_PERIODS = [
    {value: 'HOJE', label: 'Hoje'},
    {value: 'ONTEM', label: 'Ontem'},
    {value: 'ULTIMA_SEMANA', label: 'Última Semana'},
    {value: 'ULTIMO_MES', label: 'Último Mês'},
    {value: 'ULTIMO_ANO', label: 'Último Ano'},
    {value: 'MES_ATUAL', label: 'Mês Atual'},
    {value: 'ANO_ATUAL', label: 'Ano Atual'},
];

interface ReportFiltersProps {
    filtros: FiltroRelatorioWrapper[];
    onFiltersChange: (filtros: FiltroRelatorioWrapper[]) => void;
    onApplyFilters: (filtros?: ReportFilterSqlValues) => void;
}

export function ReportFilters({filtros, onFiltersChange, onApplyFilters}: ReportFiltersProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [activeFiltro, setActiveFiltro] = useState<FiltroRelatorioWrapper | null>(null);
    const [filterStates, setFilterStates] = useState<Record<number, FilterState>>({});
    const [availableInformacoes, setAvailableInformacoes] = useState<Record<number, string[]>>({});

    useEffect(() => {
        const initialStates: Record<number, FilterState> = {};
        filtros.forEach((filtro) => {
            const fr = filtro.filtroRelatorio;
            if (fr.dimensao.tipoInfo === 'TEMPO') {
                initialStates[fr.id] = {
                    tipo: 0,
                    dataInicio: '',
                    dataFim: '',
                    campoDinamico: '',
                    queryOperation: 'EQUALS',
                };
            } else if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
                initialStates[fr.id] = {
                    listaTodosSelected: [],
                };
            } else if (fr.tipo === 'FIXO') {
                initialStates[fr.id] = {
                    selected: filtro.selected,
                };
            }
        });
        setFilterStates(initialStates);

        const carregarRelacoes = async () => {
            const infosMap: Record<number, string[]> = {};
            for (const filtro of filtros) {
                const fr = filtro.filtroRelatorio;
                if (fr.dimensao.tipoInfo !== 'DESCRITIVO') continue;
                try {
                    const res = await api.get<any>(`/api/relatorios/filtros/${fr.id}/relacoes`);
                    const data = res.data ?? {};
                    infosMap[fr.id] = Array.isArray(data.informacoes) ? data.informacoes : (Array.isArray(data) ? data : []);
                } catch {
                    infosMap[fr.id] = [];
                }
            }
            setAvailableInformacoes(prev => ({...prev, ...infosMap}));
        };
        void carregarRelacoes();
    }, [filtros]);

    const handleFiltroPress = (filtro: FiltroRelatorioWrapper) => {
        if (!filtro.filtroRelatorio.exibirFiltro) return;
        setActiveFiltro(filtro);
        setModalVisible(true);
    };

    const handleClose = () => {
        setModalVisible(false);
        setActiveFiltro(null);
    };

    const buildSqlValues = (): ReportFilterSqlValues => {
        const values: ReportFilterSqlValues = {};
        for (const filtro of filtros) {
            const fr = filtro.filtroRelatorio;
            const state = filterStates[fr.id];
            if (!state || !isFilterActive(fr, state)) continue;
            if (fr.dimensao.tipoInfo === 'TEMPO') {
                const tempoState = state as TempoFilterState;
                if (tempoState.tipo === 1) {
                    values[fr.nome] = {operation: tempoState.queryOperation || 'EQUALS', value: tempoState.dataInicio || ''};
                } else if (tempoState.tipo === 2) {
                    values[fr.nome] = {operation: '=', value: tempoState.campoDinamico || ''};
                } else if (tempoState.tipo === 3) {
                    values[fr.nome] = {operation: 'BETWEEN', value: tempoState.dataInicio || '', value2: tempoState.dataFim || ''};
                }
            } else if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
                const descState = state as DescritivoFilterState;
                values[fr.nome] = {operation: 'IN', value: descState.listaTodosSelected.map(s => s.informacao).join(',')};
            } else if (fr.tipo === 'FIXO') {
                const fixoState = state as FixoFilterState;
                values[fr.nome] = {selected: fixoState.selected};
            }
        }
        return values;
    };

    const handleApply = () => {
        if (activeFiltro) {
            const fr = activeFiltro.filtroRelatorio;
            const state = filterStates[fr.id];
            const updatedFiltros = filtros.map((f) => {
                if (f.filtroRelatorio.id === fr.id) {
                    return {...f, informacao: getFilterInfo(fr, state), selected: isFilterActive(fr, state)};
                }
                return f;
            });
            onFiltersChange(updatedFiltros);
        }
        onApplyFilters(buildSqlValues());
        handleClose();
    };

    const isFilterActive = (fr: FiltroRelatorioWrapper['filtroRelatorio'], state: FilterState | undefined): boolean => {
        if (!state) return false;
        if (fr.dimensao.tipoInfo === 'TEMPO') {
            const tempoState = state as TempoFilterState;
            return tempoState.tipo !== 0;
        }
        if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
            const descState = state as DescritivoFilterState;
            return descState.listaTodosSelected.length > 0;
        }
        if (fr.tipo === 'FIXO') {
            const fixoState = state as FixoFilterState;
            return fixoState.selected;
        }
        return false;
    };

    const getFilterInfo = (fr: FiltroRelatorioWrapper['filtroRelatorio'], state: FilterState | undefined): string => {
        if (!state) return '';
        if (fr.dimensao.tipoInfo === 'TEMPO') {
            const tempoState = state as TempoFilterState;
            const typeLabel = TEMPO_TYPES.find(t => t.value === tempoState.tipo)?.label || '';
            if (tempoState.tipo === 1) {
                return `${typeLabel}: ${tempoState.queryOperation} ${tempoState.dataInicio}`;
            }
            if (tempoState.tipo === 2) {
                return `${typeLabel}: ${tempoState.campoDinamico}`;
            }
            if (tempoState.tipo === 3) {
                return `${typeLabel}: ${tempoState.dataInicio} até ${tempoState.dataFim}`;
            }
            return '';
        }
        if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
            const descState = state as DescritivoFilterState;
            return descState.listaTodosSelected.map(s => s.informacao).join(', ');
        }
        if (fr.tipo === 'FIXO') {
            const fixoState = state as FixoFilterState;
            return fixoState.selected ? 'Aplicado' : '';
        }
        return '';
    };

    const getFilterPanelStyle = (filtro: FiltroRelatorioWrapper) => {
        const fr = filtro.filtroRelatorio;
        const active = isFilterActive(fr, filterStates[fr.id]);
        if (fr.fixo && fr.exibirFiltro) return styles.filterPanelFixed;
        if (active && filtro.informacao) return styles.filterPanelActiveInfo;
        if (active) return styles.filterPanelActive;
        return styles.filterPanelDefault;
    };

    const updateTempoState = (frId: number, updates: Partial<TempoFilterState>) => {
        setFilterStates(prev => ({...prev, [frId]: {...prev[frId], ...updates}}));
    };

    const updateDescritivoState = (frId: number, updates: Partial<DescritivoFilterState>) => {
        setFilterStates(prev => ({...prev, [frId]: {...prev[frId], ...updates}}));
    };

    const updateFixoState = (frId: number, updates: Partial<FixoFilterState>) => {
        setFilterStates(prev => ({...prev, [frId]: {...prev[frId], ...updates}}));
    };

    const renderTempoFilter = (fr: FiltroRelatorioWrapper['filtroRelatorio'], state: TempoFilterState) => {
        return (
            <View>
                <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Tipo:</Text>
                    <View style={styles.tempoTypeContainer}>
                        {TEMPO_TYPES.map(t => (
                            <Pressable
                                key={t.value}
                                style={[
                                    styles.tempoTypeButton,
                                    state.tipo === t.value && styles.tempoTypeButtonActive
                                ]}
                                onPress={() => updateTempoState(fr.id, {tipo: t.value as 0 | 1 | 2 | 3})}
                            >
                                <Text style={[
                                    styles.tempoTypeButtonText,
                                    state.tipo === t.value && styles.tempoTypeButtonTextActive
                                ]}>
                                    {t.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {state.tipo === 1 && (
                    <View>
                        <View style={styles.filterField}>
                            <Text style={styles.fieldLabel}>Operação:</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={state.queryOperation || 'EQUALS'}
                                editable={false}
                            >
                                {STRING_OPERATIONS.map(o => (
                                    <Text key={o.value}>{o.label}</Text>
                                ))}
                            </TextInput>
                        </View>
                        <View style={styles.filterField}>
                            <Text style={styles.fieldLabel}>Data Início:</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={state.dataInicio || ''}
                                onChangeText={text => updateTempoState(fr.id, {dataInicio: text})}
                                placeholder="DD/MM/AAAA"
                            />
                        </View>
                    </View>
                )}

                {state.tipo === 2 && (
                    <View style={styles.filterField}>
                        <Text style={styles.fieldLabel}>Período Dinâmico:</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={state.campoDinamico || ''}
                            editable={false}
                        >
                            {DYNAMIC_PERIODS.map(p => (
                                <Text key={p.value}>{p.label}</Text>
                            ))}
                        </TextInput>
                    </View>
                )}

                {state.tipo === 3 && (
                    <View style={styles.dateRangeContainer}>
                        <View style={styles.filterField}>
                            <Text style={styles.fieldLabel}>Data Início:</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={state.dataInicio || ''}
                                onChangeText={text => updateTempoState(fr.id, {dataInicio: text})}
                                placeholder="DD/MM/AAAA"
                            />
                        </View>
                        <View style={styles.filterField}>
                            <Text style={styles.fieldLabel}>Data Fim:</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={state.dataFim || ''}
                                onChangeText={text => updateTempoState(fr.id, {dataFim: text})}
                                placeholder="DD/MM/AAAA"
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const renderDescritivoFilter = (fr: FiltroRelatorioWrapper['filtroRelatorio'], state: DescritivoFilterState) => {
        const [availableItems] = useState<Array<{informacao: string}>>([
            {informacao: 'Item 1'},
            {informacao: 'Item 2'},
            {informacao: 'Item 3'},
            {informacao: 'Item 4'},
            {informacao: 'Item 5'},
        ]);

        const addItem = (item: {informacao: string}) => {
            if (!state.listaTodosSelected.find(s => s.informacao === item.informacao)) {
                updateDescritivoState(fr.id, {
                    listaTodosSelected: [...state.listaTodosSelected, item],
                });
            }
        };

        const removeItem = (item: {informacao: string}) => {
            updateDescritivoState(fr.id, {
                listaTodosSelected: state.listaTodosSelected.filter(s => s.informacao !== item.informacao),
            });
        };

        return (
            <View style={styles.descritivoContainer}>
                <View style={styles.descritivoColumn}>
                    <Text style={styles.descritivoColumnTitle}>Filtros Disponíveis</Text>
                    <View style={styles.listContainer}>
                        <FlatList
                            data={availableItems}
                            keyExtractor={(_, idx) => String(idx)}
                            renderItem={({item, index}) => (
                                <View style={styles.listItem}>
                                    <Text style={styles.listItemText}>{item.informacao}</Text>
                                    <Pressable style={styles.listActionButton} onPress={() => addItem(item)}>
                                        <Text style={styles.listActionButtonText}>+</Text>
                                    </Pressable>
                                </View>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.listSeparator}/>}
                        />
                    </View>
                </View>
                <View style={styles.descritivoColumn}>
                    <Text style={styles.descritivoColumnTitle}>Filtros Aplicados</Text>
                    <View style={styles.listContainer}>
                        {state.listaTodosSelected.length === 0 ? (
                            <Text style={styles.emptyListText}>Nenhum filtro aplicado</Text>
                        ) : (
                            <FlatList
                                data={state.listaTodosSelected}
                                keyExtractor={(_, idx) => String(idx)}
                                renderItem={({item, index}) => (
                                    <View style={styles.listItem}>
                                        <Text style={styles.listItemText}>{item.informacao}</Text>
                                        <Pressable style={[styles.listActionButton, styles.listActionButtonRemove]} onPress={() => removeItem(item)}>
                                            <Text style={styles.listActionButtonText}>-</Text>
                                        </Pressable>
                                    </View>
                                )}
                                ItemSeparatorComponent={() => <View style={styles.listSeparator}/>}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderFixoFilter = (fr: FiltroRelatorioWrapper['filtroRelatorio'], state: FixoFilterState) => {
        return (
            <View style={styles.filterField}>
                <Pressable style={styles.checkboxContainer} onPress={() => updateFixoState(fr.id, {selected: !state.selected})}>
                    <View style={[
                        styles.checkbox,
                        state.selected && styles.checkboxChecked
                    ]}>
                        {state.selected && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Aplicar filtro fixo: {fr.nome}</Text>
                </Pressable>
            </View>
        );
    };

    const renderFilterContent = () => {
        if (!activeFiltro) return null;

        const fr = activeFiltro.filtroRelatorio;
        const state = filterStates[fr.id];

        if (fr.dimensao.tipoInfo === 'TEMPO') {
            return renderTempoFilter(fr, state as TempoFilterState);
        }
        if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
            return renderDescritivoFilter(fr, state as DescritivoFilterState);
        }
        if (fr.tipo === 'FIXO') {
            return renderFixoFilter(fr, state as FixoFilterState);
        }
        return <Text>Tipo de filtro não suportado</Text>;
    };

    return (
        <>
            <View style={styles.filterPanelsContainer}>
                {filtros
                    .filter(f => f.filtroRelatorio.exibirFiltro)
                    .map((filtro) => (
                        <Pressable
                            key={filtro.filtroRelatorio.id}
                            style={getFilterPanelStyle(filtro)}
                            onPress={() => handleFiltroPress(filtro)}
                        >
                            <Text style={styles.filterPanelIcon}>🔍</Text>
                            <Text style={styles.filterPanelText} numberOfLines={1}>
                                {filtro.filtroRelatorio.nome}
                            </Text>
                        </Pressable>
                    ))}
            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
            >
                <Pressable style={styles.modalOverlay} onPress={handleClose}>
                    <Pressable style={styles.modalBox} onPress={() => {}}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Filtro: {activeFiltro?.filtroRelatorio.nome || ''}
                            </Text>
                            <Pressable style={styles.closeBtn} onPress={handleClose}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </Pressable>
                        </View>
                        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                            {renderFilterContent()}
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={handleClose}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.clearButton]}
                                onPress={() => {
                                    if (activeFiltro) {
                                        const fr = activeFiltro.filtroRelatorio;
                                        let clearedState: FilterState;
                                        if (fr.dimensao.tipoInfo === 'TEMPO') {
                                            clearedState = {tipo: 0, dataInicio: '', dataFim: '', campoDinamico: '', queryOperation: 'EQUALS'};
                                        } else if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
                                            clearedState = {listaTodosSelected: []};
                                        } else {
                                            clearedState = {selected: false};
                                        }
                                        setFilterStates(prev => ({...prev, [fr.id]: clearedState}));
                                    }
                                }}
                            >
                                <Text style={styles.clearButtonText}>Limpar</Text>
                            </Pressable>
                            <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleApply}>
                                <Text style={styles.saveButtonText}>Aplicar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    filterPanelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginBottom: 8,
    },
    filterPanelDefault: {
        height: 28,
        minWidth: 120,
        maxWidth: 200,
        paddingHorizontal: 8,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.bgPrimary,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    filterPanelActive: {
        backgroundColor: Colors.primary + '15',
        borderColor: Colors.primary,
    },
    filterPanelActiveInfo: {
        backgroundColor: Colors.success + '15',
        borderColor: Colors.success,
    },
    filterPanelFixed: {
        backgroundColor: Colors.error + '15',
        borderColor: Colors.error,
    },
    filterPanelIcon: {
        fontSize: 12,
    },
    filterPanelText: {
        fontSize: Typography.sizes.xs,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.medium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.modalOverlay,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalBox: {
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xxl,
        maxHeight: '85%',
        ...Shadows.modal,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.borderGold,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.headerStart,
        borderBottomWidth: 3,
        borderBottomColor: Colors.gold,
    },
    modalTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semibold,
        color: Colors.textWhite,
        letterSpacing: 0.3,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.modalCloseBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: Colors.modalCloseColor,
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.medium,
    },
    modalScroll: {
        maxHeight: '60%',
    },
    modalScrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
    },
    filterSection: {
        marginBottom: Spacing.md,
    },
    filterSectionTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    tempoTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    tempoTypeButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.bgPrimary,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    tempoTypeButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    tempoTypeButtonText: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },
    tempoTypeButtonTextActive: {
        color: Colors.textWhite,
        fontWeight: Typography.weights.semibold,
    },
    filterField: {
        marginBottom: Spacing.md,
    },
    fieldLabel: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    fieldInput: {
        borderWidth: 1,
        borderColor: Colors.formInputBorder,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        backgroundColor: Colors.bgSecondary,
    },
    dateRangeContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
        flexWrap: 'wrap',
    },
    descritivoContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    descritivoColumn: {
        flex: 1,
    },
    descritivoColumnTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    listContainer: {
        maxHeight: 300,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.bgSecondary,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    listSeparator: {
        borderBottomWidth: 1,
        borderColor: Colors.borderLight,
        marginHorizontal: Spacing.md,
    },
    listItemText: {
        fontSize: Typography.sizes.base,
        color: Colors.textPrimary,
        flexShrink: 1,
    },
    listActionButton: {
        width: 28,
        height: 28,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listActionButtonRemove: {
        backgroundColor: Colors.errorBg,
    },
    listActionButtonText: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    emptyListText: {
        padding: Spacing.lg,
        textAlign: 'center',
        color: Colors.textLight,
        fontSize: Typography.sizes.base,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: BorderRadius.sm,
        borderWidth: 2,
        borderColor: Colors.borderMedium,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bgSecondary,
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxCheck: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    checkboxLabel: {
        fontSize: Typography.sizes.base,
        color: Colors.textPrimary,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    modalButton: {
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        marginLeft: Spacing.md,
    },
    cancelButton: {
        backgroundColor: Colors.bgPrimary,
        borderWidth: 1,
        borderColor: Colors.borderMedium,
    },
    cancelButtonText: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    clearButton: {
        backgroundColor: Colors.warningBg,
    },
    clearButtonText: {
        color: Colors.goldText,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        ...Shadows.gold,
    },
    saveButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
});