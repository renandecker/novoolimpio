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
import type {ApiItem, SearchFilterRequest, FilterCondition, QueryOperation} from './types';
import {STRING_OPERATIONS, NUMBER_OPERATIONS} from './types';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from './theme';
import {RowMenu, type RowMenuItem} from './RowMenu';

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

export interface ModuleListActionGroup {
    icon: React.ReactNode;
    className: string;
    title?: string;
    items: RowMenuItem[];
    permission?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE';
}

export function ModuleList({
                                path,
                                title,
                                params,
                                extraActions,
                                actionGroups,
                                outcome: customOutcome,
                                hideCreate = false,
                                hideUpdate = false,
                                hideDelete = false,
                                hideView = false,
                            }: {
    path: string;
    title?: string;
    params?: Record<string, string | number | boolean | undefined>;
    extraActions?: ModuleListExtraAction[];
    actionGroups?: ModuleListActionGroup[];
    outcome?: string;
    hideCreate?: boolean;
    hideUpdate?: boolean;
    hideDelete?: boolean;
    hideView?: boolean;
}) {
    const [sortField, setSortField] = useState<string>('id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortRequest = {field: sortField, direction: sortDirection};
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [sizePickerOpen, setSizePickerOpen] = useState(false);
    const [modal, setModal] = useState<ModalState>(null);
    const [notice, setNotice] = useState('');
    const [runningAction, setRunningAction] = useState<string | null>(null);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterParams, setFilterParams] = useState<SearchFilterRequest>({filters: {}});
    const [filterInputs, setFilterInputs] = useState<Record<string, string>>({});
    const [filterOps, setFilterOps] = useState<Record<string, QueryOperation>>({});
    const [filterValues2, setFilterValues2] = useState<Record<string, string>>({});

    const segments = path.split('/').filter(Boolean);
    const feature = segments[2] ?? '';
    const resource = segments[3] ?? '';
    const outcome = customOutcome ?? (feature && resource ? `view/${feature}/${resource}` : '');
    const entityTitle = toTitle(resource.replace(/^(form|list|colunas)/i, '') || resource);

    const screenTitle = title ?? (resource ? entityTitle : toTitle(feature) || 'Lista');

    const canCreate = !hideCreate && can(session, 'CREATE', outcome);
    const canUpdate = !hideUpdate && can(session, 'UPDATE', outcome);
    const canDelete = !hideDelete && can(session, 'DELETE', outcome);
    const canExecute = can(session, 'EXECUTE', outcome);
    const isAdminUser = isAdmin(session);
    const canRelatorio = !hideView && (isAdminUser || canExecute);

    const q = useModulePaged(path, page, size, params, filterParams, sortRequest);
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
        setFilterOps({});
        setFilterValues2({});
        setFilterModalVisible(true);
    };

    const applyFilters = () => {
        const filters: Record<string, FilterCondition> = {};
        for (const [key, value] of Object.entries(filterInputs)) {
            if (value !== null && value !== undefined && value !== '') {
                const op = filterOps[key] ?? 'CONTAINS';
                filters[key] = {
                    operation: op,
                    value,
                    value2: op === 'BETWEEN' ? (filterValues2[key] ?? undefined) : undefined,
                };
            }
        }
        setFilterParams({filters});
        setPage(0);
        setFilterModalVisible(false);
    };

    const clearFilters = () => {
        setFilterInputs({});
        setFilterOps({});
        setFilterValues2({});
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
                <Pressable style={[styles.exportButton, styles.searchButton]} onPress={openFilterModal}>
                    <Text style={styles.exportButtonText}>Buscar</Text>
                </Pressable>
                {canRelatorio && items.length > 0 && (
                    <>
                    </>
                )}
            </View>
            <View style={{paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f5f5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#ddd'}}>
                <Text style={{fontSize: 12, fontWeight: '600', color: '#333'}}>Ordenar por:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 6, alignItems: 'center'}}>
                    {['id', ...Object.keys(items[0] ?? {}).filter(k => k !== 'dadosJson')].map(field => {
                        const isSelected = sortField === field;
                        return (
                            <Pressable
                                key={field}
                                onPress={() => handleSort(field)}
                                style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                    borderRadius: 12,
                                    backgroundColor: isSelected ? '#007bff' : '#e0e0e0',
                                }}
                            >
                                <Text style={{fontSize: 12, color: isSelected ? '#fff' : '#333', fontWeight: isSelected ? '700' : '400'}}>
                                    {toTitle(field)} {isSelected ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
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
                                        const isRemover = action.key === 'remover' || action.key === 'remove' || action.title === 'Remover';
                                        return (
                                            <Pressable
                                                key={action.key}
                                                style={[styles.rowButton, isRemover && styles.dangerButtonSolid]}
                                                onPress={() => action.onPress(item)}
                                            >
                                                <Text style={[styles.rowButtonText, isRemover && styles.dangerButtonSolidText]}>{action.icon ? `${action.icon} ` : ''}{action.title}</Text>
                                            </Pressable>
                                        );
                                    })}
                                    {actionGroups?.map((group) => {
                                        if (group.permission && !can(session, group.permission, outcome)) return null;
                                        return (
                                            <RowMenu
                                                key={group.className}
                                                icon={group.icon}
                                                className={group.className}
                                                title={group.title}
                                                items={group.items}
                                            />
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
                            initialOps={filterOps}
                            initialValues2={filterValues2}
                            onClose={() => setFilterModalVisible(false)}
                            onApply={applyFilters}
                            onClear={clearFilters}
                            onChangeField={(key, value) => setFilterInputs(prev => ({...prev, [key]: value}))}
                            onChangeOp={(key, op) => setFilterOps(prev => ({...prev, [key]: op}))}
                            onChangeValue2={(key, value) => setFilterValues2(prev => ({...prev, [key]: value}))}
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
    initialOps,
    initialValues2,
    onClose,
    onApply,
    onClear,
    onChangeField,
    onChangeOp,
    onChangeValue2,
}: {
    columns: string[];
    initialFilters: Record<string, string>;
    initialOps: Record<string, QueryOperation>;
    initialValues2: Record<string, string>;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
    onChangeField: (key: string, value: string) => void;
    onChangeOp: (key: string, op: QueryOperation) => void;
    onChangeValue2: (key: string, value: string) => void;
}) {
    const isNumberOp = (op: QueryOperation) =>
        ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'BETWEEN'].includes(op);

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
                    columns.map((field) => {
                        const op = initialOps[field] ?? 'CONTAINS';
                        const showBetween = op === 'BETWEEN';
                        return (
                            <View key={field} style={styles.filterField}>
                                <Text style={styles.fieldLabel}>{toTitle(field)}</Text>
                                <View style={styles.filterRow}>
                                    <View style={styles.filterOpContainer}>
                                        {STRING_OPERATIONS.map(o => (
                                            <Pressable
                                                key={o.value}
                                                style={[styles.filterOpBtn, op === o.value && styles.filterOpBtnActive]}
                                                onPress={() => onChangeOp(field, o.value)}
                                            >
                                                <Text style={[styles.filterOpBtnText, op === o.value && styles.filterOpBtnTextActive]}>
                                                    {o.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                    <TextInput
                                        style={styles.fieldInput}
                                        value={initialFilters[field] ?? ''}
                                        onChangeText={(text) => onChangeField(field, text)}
                                        placeholder={`Filtrar por ${toTitle(field)}`}
                                    />
                                </View>
                                {showBetween && (
                                    <View style={styles.filterBetweenRow}>
                                        <Text style={styles.filterBetweenLabel}>até</Text>
                                        <TextInput
                                            style={[styles.fieldInput, {flex: 1}]}
                                            value={initialValues2[field] ?? ''}
                                            onChangeText={(text) => onChangeValue2(field, text)}
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
        paddingHorizontal: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginVertical: Spacing.xs,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
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
        marginTop: Spacing.sm,
        gap: Spacing.sm,
    },
    rowButton: {
        backgroundColor: Colors.primary + '15',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginRight: Spacing.sm,
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
    filterField: {
        marginBottom: Spacing.xl,
        backgroundColor: Colors.bgPrimary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    filterRow: {
        flexDirection: 'column',
        gap: Spacing.xs,
    },
    filterOpContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    filterOpBtn: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.bgPrimary,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    filterOpBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterOpBtnText: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },
    filterOpBtnTextActive: {
        color: Colors.textWhite,
        fontWeight: Typography.weights.semibold,
    },
    filterBetweenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    filterBetweenLabel: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
    },
});