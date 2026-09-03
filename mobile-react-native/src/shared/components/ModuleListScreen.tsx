import React, {useMemo, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {PAGE_SIZES, useModulePaged} from './useModulePaged';
import {executeAction} from './actions';
import {can, isAdmin} from './permissions';
import {useAuth} from './auth';
import type {ApiItem} from './types';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from './theme';

const PREFERRED_LABELS = ['nome', 'descricao', 'razao_social', 'nome_fantasia', 'username', 'titulo', 'rotulo', 'sigla', 'sobrenome', 'login', 'uf', 'tema'];

const toTitle = (value: string) =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/^_/, '')
        .replace(/^./, (c) => c.toUpperCase());

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const primaryLabel = (item: ApiItem) => {
    const record = asRecord(item);
    for (const key of PREFERRED_LABELS) {
        const value = record[key];
        if (value !== null && value !== undefined && String(value) !== '') return String(value);
    }
    for (const key of Object.keys(record)) {
        if (key.endsWith('_descricao')) {
            const value = record[key];
            if (value !== null && value !== undefined && String(value) !== '') return String(value);
        }
    }
    for (const key of Object.keys(record)) {
        if (key !== 'id' && key !== 'dadosJson') return String(record[key] ?? '');
    }
    return `#${item.id}`;
};

const STATUS_COLORS: Record<string, string> = {
    LIBERADA: '#32CD32',
    PENDENTE: '#FF0000',
    CANCELADA: '#000000',
    LOTADA: '#FFA500',
    EM_ANDAMENTO: '#000bc8',
    FINALIZADA: '#8000FF',
    CONCLUIDA: '#545454',
    INICIANDO: '#61210B',
};

const editableFields = (item: ApiItem | null) => {
    if (!item) return ['nome'];
    return Object.keys(asRecord(item)).filter((key) => key !== 'id' && key !== 'dadosJson');
};

const apiErrorMessage = (error: unknown) =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

type ModalState =
    | { mode: 'create' }
    | { mode: 'edit'; item: ApiItem }
    | null;

export interface ModuleListExtraAction {
    key: string;
    title: string;
    icon?: string;
    permission?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE';
    onPress: (item: ApiItem) => void;
}

export function ModuleList({
                                path,
                                title,
                                params,
                                extraActions,
                                outcome: customOutcome,
                            }: {
    path: string;
    title?: string;
    params?: Record<string, string | number | boolean | undefined>;
    extraActions?: ModuleListExtraAction[];
    outcome?: string;
}) {
    const {session} = useAuth();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [sizePickerOpen, setSizePickerOpen] = useState(false);
    const [modal, setModal] = useState<ModalState>(null);
    const [notice, setNotice] = useState('');
    const [runningAction, setRunningAction] = useState<string | null>(null);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
    const [filterInputs, setFilterInputs] = useState<Record<string, string>>({});

    const segments = path.split('/').filter(Boolean);
    const feature = segments[2] ?? '';
    const resource = segments[3] ?? '';
    const outcome = customOutcome ?? (feature && resource ? `view/${feature}/${resource}` : '');
    const entityTitle = toTitle(resource.replace(/^(form|list|colunas)/i, '') || resource);

    const screenTitle = title ?? (resource ? entityTitle : toTitle(feature) || 'Lista');

    const canCreate = can(session, 'CREATE', outcome);
    const canUpdate = can(session, 'UPDATE', outcome);
    const canDelete = can(session, 'DELETE', outcome);
    const canExecute = can(session, 'EXECUTE', outcome);
    const isAdminUser = isAdmin(session);
    const canRelatorio = isAdminUser || canExecute;

    const q = useModulePaged(path, page, size, {...params, ...filterParams});
    const items = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);

    const runAction = (action: string, item: ApiItem) => {
        setRunningAction(action);
        setNotice('');
        executeAction(feature, action, outcome, JSON.stringify({id: item.id}))
            .then(() => {
                setNotice(`Ação "${toTitle(action)}" executada no registro ${item.id}.`);
                q.refetch();
            })
            .catch((error) => setNotice(`Falha ao executar "${toTitle(action)}": ${apiErrorMessage(error)}`))
            .finally(() => setRunningAction(null));
    };

    const exportarPDF = (item: ApiItem) => {
        const url = `/api/relatorios/relatorio/disponiveis/TABELA/${item.id}`;
        Linking.openURL(url);
    };

    const exportarDOCX = (item: ApiItem) => {
        // Exportar DOCX - implementar conforme necessário
    };

    const exportarExcel = (item: ApiItem) => {
        const url = `/api/relatorios/relatorio/disponiveis/GRAFICO/${item.id}`;
        Linking.openURL(url);
    };

    const fields = useMemo(
        () => (modal?.mode === 'edit' ? editableFields(modal.item) : editableFields(items[0] ?? null)),
        [modal, items],
    );

    const saveCreate = (values: Record<string, unknown>) => {
        q.create.mutate({nome: 'Novo registro', ...values} as unknown as ApiItem, {
            onError: (error) => setNotice(`Erro ao criar: ${apiErrorMessage(error)}`),
        });
        setModal(null);
    };

    const saveEdit = (item: ApiItem, values: Record<string, unknown>) => {
        q.update.mutate({
            id: item.id,
            body: {nome: asRecord(item).nome ?? primaryLabel(item), ...values} as unknown as ApiItem
        }, {
            onError: (error) => setNotice(`Erro ao salvar: ${apiErrorMessage(error)}`),
        });
        setModal(null);
    };

    const confirmDelete = (item: ApiItem) => {
        q.remove.mutate(item.id, {onError: (error) => setNotice(`Erro ao excluir: ${apiErrorMessage(error)}`)});
    };

    if (q.isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Colors.primary} size="large"/>
            </View>
        );
    }

    if (q.isError) {
        const message = apiErrorMessage(q.error);
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Erro ao carregar os dados.</Text>
                {message ? <Text style={styles.errorDetail}>{message}</Text> : null}
            </View>
        );
    }

    const openFilterModal = () => {
        setFilterInputs({});
        setFilterModalVisible(true);
    };

    const applyFilters = () => {
        const cleanFilters: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(filterInputs)) {
            if (value !== null && value !== undefined && value !== '') {
                cleanFilters[key] = value;
            }
        }
        setFilterParams(cleanFilters);
        setPage(0);
        setFilterModalVisible(false);
    };

    const clearFilters = () => {
        setFilterInputs({});
    };

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>{screenTitle}</Text>
                {canCreate && (
                    <Pressable style={styles.primaryButton} onPress={() => setModal({mode: 'create'})}>
                        <Text style={styles.primaryButtonText}>Novo</Text>
                    </Pressable>
                )}
                {canRelatorio && items.length > 0 && (
                    <>
                        <Pressable style={[styles.exportButton, styles.searchButton]} onPress={openFilterModal}>
                            <Text style={styles.exportButtonText}>Busca</Text>
                        </Pressable>
                        <Pressable style={styles.exportButton} onPress={() => {
                            // Show action sheet or modal with export options
                            Alert.alert(
                                'Exportar',
                                'Selecione o formato de exportação',
                                [
                                    {text: 'PDF', onPress: () => exportarPDF(items[0])},
                                    {text: 'DOCX', onPress: () => exportarDOCX(items[0])},
                                    {text: 'Excel', onPress: () => exportarExcel(items[0])},
                                    {text: 'Cancelar', style: 'cancel'},
                                ]
                            );
                        }}>
                            <Text style={styles.exportButtonText}>Exportar</Text>
                        </Pressable>
                    </>
                )}
            </View>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            {items.length === 0 ? (
                <Text style={styles.empty}>Nenhum registro encontrado.</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    refreshing={q.isFetching}
                    onRefresh={() => q.refetch()}
                    renderItem={({item}) => {
                        const record = asRecord(item);
                        const statusValue = String(record.status ?? '');
                        const statusColor = STATUS_COLORS[statusValue];
                        return (
                            <View style={styles.row}>
                                <View style={styles.rowMain}>
                                    <View style={styles.rowLabelContainer}>
                                        <Text style={styles.rowText}>{primaryLabel(item)}</Text>
                                        {statusValue && statusColor && (
                                            <View style={[styles.statusBadge, {backgroundColor: statusColor + '22'}]}>
                                                <Text style={[styles.statusText, {color: statusColor}]}>
                                                    {statusValue}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.rowId}>#{item.id}</Text>
                                </View>
                                <View style={styles.rowActions}>
                                    {extraActions?.map((action) => {
                                        if (action.permission && !can(session, action.permission, outcome)) return null;
                                        return (
                                            <Pressable
                                                key={action.key}
                                                style={styles.rowButton}
                                                onPress={() => action.onPress(item)}
                                            >
                                                <Text style={styles.rowButtonText}>{action.icon ? `${action.icon} ` : ''}{action.title}</Text>
                                            </Pressable>
                                        );
                                    })}
                                    {canUpdate && (
                                        <Pressable style={styles.rowButton} onPress={() => setModal({mode: 'edit', item})}>
                                            <Text style={styles.rowButtonText}>Editar</Text>
                                        </Pressable>
                                    )}
                                    {canDelete && (
                                        <Pressable
                                            style={[styles.rowButton, styles.dangerButton]}
                                            onPress={() =>
                                                Alert.alert('Excluir registro', `Deseja realmente excluir o registro #${item.id}?`, [
                                                    {text: 'Cancelar', style: 'cancel'},
                                                    {
                                                        text: 'Excluir',
                                                        style: 'destructive',
                                                        onPress: () => confirmDelete(item)
                                                    },
                                                ])
                                            }
                                        >
                                            <Text style={styles.rowButtonText}>Excluir</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            <View style={styles.paginator}>
                <Pressable
                    style={[styles.pageButton, (page === 0 || q.isFetching) && styles.pageButtonDisabled]}
                    disabled={page === 0 || q.isFetching}
                    onPress={() => setPage((current) => Math.max(0, current - 1))}
                >
                    <Text style={styles.pageButtonText}>Anterior</Text>
                </Pressable>
                <Text style={styles.pageInfo}>
                    Página {page + 1} de {totalPages} · Total: {totalElements}
                </Text>
                <Pressable
                    style={[styles.pageButton, (page >= totalPages - 1 || q.isFetching) && styles.pageButtonDisabled]}
                    disabled={page >= totalPages - 1 || q.isFetching}
                    onPress={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                >
                    <Text style={styles.pageButtonText}>Próxima</Text>
                </Pressable>
            </View>
            <Pressable style={styles.sizeSelector} onPress={() => setSizePickerOpen(true)}>
                <Text style={styles.sizeSelectorText}>{size} por página ▾</Text>
            </Pressable>

            <Modal visible={sizePickerOpen} transparent animationType="fade"
                   onRequestClose={() => setSizePickerOpen(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setSizePickerOpen(false)}>
                    <Pressable style={styles.sizeOptionsBox} onPress={(e) => e.stopPropagation()}>
                        {PAGE_SIZES.map((option) => (
                            <Pressable
                                key={option}
                                style={styles.sizeOption}
                                onPress={() => {
                                    setSize(option);
                                    setPage(0);
                                    setSizePickerOpen(false);
                                }}
                            >
                                <Text style={[styles.sizeOptionText, option === size && styles.sizeOptionTextActive]}>
                                    {option} registros por página
                                </Text>
                            </Pressable>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
                <Pressable style={styles.modalOverlay} onPress={() => setModal(null)}>
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <RecordModal
                            title={modal?.mode === 'edit' ? `Editar ${entityTitle} #${modal.item.id}` : `Novo ${entityTitle}`}
                            fields={fields}
                            initial={modal?.mode === 'edit' ? asRecord(modal.item) : {}}
                            submitLabel="Salvar"
                            onCancel={() => setModal(null)}
                            onSubmit={(values) => (modal?.mode === 'edit' ? saveEdit(modal.item, values) : saveCreate(values))}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
            <Modal visible={filterModalVisible} transparent animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <FilterModal
                            columns={Object.keys(asRecord(items[0] ?? {})).filter(k => k !== 'id' && k !== 'dadosJson')}
                            initialFilters={filterInputs}
                            onClose={() => setFilterModalVisible(false)}
                            onApply={applyFilters}
                            onClear={clearFilters}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

function RecordModal({
                          title,
                          fields,
                          initial,
                          submitLabel,
                          onCancel,
                          onSubmit,
                      }: {
    title: string;
    fields: string[];
    initial: Record<string, unknown>;
    submitLabel: string;
    onCancel: () => void;
    onSubmit: (values: Record<string, unknown>) => void;
}) {
    const [values, setValues] = useState<Record<string, string>>(() => {
        const copy: Record<string, string> = {};
        for (const field of fields) {
            const value = initial[field];
            copy[field] = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
        }
        return copy;
    });

    return (
        <View style={styles.recordModalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <Pressable style={styles.closeBtn} onPress={onCancel} accessibilityLabel="Fechar">
                    <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
                {fields.length === 0 ? (
                    <Text style={styles.modalEmpty}>Nenhum campo disponível para edição.</Text>
                ) : (
                    fields.map((field) => (
                        <View key={field} style={styles.field}>
                            <Text style={styles.fieldLabel}>{toTitle(field)}</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={values[field] ?? ''}
                                onChangeText={(text) => setValues((prev) => ({...prev, [field]: text}))}
                            />
                        </View>
                    ))
                )}
            </ScrollView>
            <View style={styles.modalActions}>
                <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.saveButton]} onPress={() => onSubmit(values)}>
                    <Text style={styles.modalButtonText}>{submitLabel}</Text>
                </Pressable>
            </View>
        </View>
    );
}

function FilterModal({
    columns,
    initialFilters,
    onClose,
    onApply,
    onClear,
}: {
    columns: string[];
    initialFilters: Record<string, string>;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
}) {
    const [filters, setFilters] = useState<Record<string, string>>(() => ({...initialFilters}));

    const handleChange = (key: string, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    };

    return (
        <View style={styles.recordModalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtros de Busca</Text>
                <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                    <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
                {columns.length === 0 ? (
                    <Text style={styles.modalEmpty}>Nenhum campo disponível para filtro.</Text>
                ) : (
                    columns.map((field) => (
                        <View key={field} style={styles.field}>
                            <Text style={styles.fieldLabel}>{toTitle(field)}</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={filters[field] ?? ''}
                                onChangeText={(text) => handleChange(field, text)}
                                placeholder={`Filtrar por ${toTitle(field)}`}
                            />
                        </View>
                    ))
                )}
            </ScrollView>
            <View style={styles.modalActions}>
                <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, {backgroundColor: Colors.warningBg}]} onPress={onClear}>
                    <Text style={styles.cancelButtonText}>Limpar</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.saveButton]} onPress={onApply}>
                    <Text style={styles.modalButtonText}>Pesquisar</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
        padding: Spacing.lg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.bgPrimary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        ...Shadows.gold,
    },
    primaryButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    notice: {
        backgroundColor: Colors.warningBg,
        borderWidth: 1,
        borderColor: Colors.goldBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        color: Colors.goldText,
    },
    empty: {
        textAlign: 'center',
        color: Colors.textLight,
        marginTop: Spacing.xl,
        fontSize: Typography.sizes.lg,
    },
    row: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.borderLight,
    },
    rowMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowText: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        flexShrink: 1,
        marginRight: Spacing.md,
    },
    rowId: {
        fontSize: Typography.sizes.sm,
        color: Colors.textLight,
    },
    rowActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.xs,
    },
    rowButton: {
        backgroundColor: Colors.primary + '15',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        marginRight: Spacing.xs,
        marginTop: Spacing.xs,
    },
    dangerButton: {
        backgroundColor: Colors.errorBg,
    },
    rowButtonText: {
        color: Colors.primary,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    rowLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        marginRight: Spacing.md,
    },
    statusBadge: {
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    statusText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        textAlign: 'center',
    },
    errorDetail: {
        color: Colors.textLight,
        fontSize: Typography.sizes.base,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    paginator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderColor: Colors.borderLight,
    },
    pageButton: {
        backgroundColor: Colors.primary + '15',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    pageButtonDisabled: {
        opacity: 0.4,
    },
    pageButtonText: {
        color: Colors.primary,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    pageInfo: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
        flexShrink: 1,
        textAlign: 'center',
        marginHorizontal: Spacing.sm,
    },
    sizeSelector: {
        alignSelf: 'flex-end',
        marginTop: Spacing.md,
    },
    sizeSelectorText: {
        color: Colors.primary,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    sizeOptionsBox: {
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginHorizontal: Spacing.xxxl,
        ...Shadows.medium,
    },
    sizeOption: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    sizeOptionText: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
    },
    sizeOptionTextActive: {
        color: Colors.primary,
        fontWeight: Typography.weights.semibold,
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
    recordModalContainer: {
        flex: 1,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xxl,
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
        flexGrow: 0,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
    },
    modalEmpty: {
        color: Colors.textLight,
        marginBottom: Spacing.md,
        fontSize: Typography.sizes.lg,
        textAlign: 'center',
    },
    field: {
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
    saveButton: {
        backgroundColor: Colors.primary,
        ...Shadows.gold,
    },
    modalButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    exportButton: {
        backgroundColor: Colors.goldBg,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        marginLeft: Spacing.md,
    },
    exportButtonText: {
        color: Colors.goldText,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    searchButton: {
        backgroundColor: Colors.success,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        marginLeft: Spacing.md,
    },
});