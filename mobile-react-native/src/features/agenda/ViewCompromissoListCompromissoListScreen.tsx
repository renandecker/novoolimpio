import React, {useState} from 'react';
import {ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {Alert} from '../../shared/components/SweetAlert';
import {can} from '../../shared/services/permissions';
import {useAuth} from '../../features/auth/auth';
import type {ApiItem, PagedResponse} from '../../shared/types/types';

interface StatusOption {
    id: number;
    descricao?: string;
}

interface Resultado {
    id: number;
    descricao: string;
}

const rec = (item: unknown): Record<string, unknown> =>
    (item && typeof item === 'object' ? item as Record<string, unknown> : {});

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    return m ? `${m[3]}/${m[2]}/${m[1]}` : String(value);
};

const PAGE_SIZE = 20;

const apiErrorMessage = (error: unknown) =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

export default function ViewCompromissoListCompromissoListScreen() {
    const {session} = useAuth();
    const [page, setPage] = useState(0);
    const [trocaStatusItem, setTrocaStatusItem] = useState<ApiItem | null>(null);
    const [resultadosModal, setResultadosModal] = useState<{ id: number; list: Resultado[] } | null>(null);
    const [loadingResultados, setLoadingResultados] = useState(false);

    const outcome = 'view/compromisso/listCompromisso';
    const canCreate = can(session, 'CREATE', outcome);
    const canUpdate = can(session, 'UPDATE', outcome);
    const canDelete = can(session, 'DELETE', outcome);

    const q = useQuery({
        queryKey: ['compromisso-list', page],
        queryFn: async () => (await api.get<PagedResponse<ApiItem>>('/api/view/compromisso/listCompromisso/paged', {
            params: {page, size: PAGE_SIZE},
        })).data,
    });

    const statusesQuery = useQuery({
        queryKey: ['status-compromisso-options'],
        queryFn: async () => (await api.get<StatusOption[]>('/api/view/statusCompromisso/listStatusCompromisso')).data,
    });
    const statusOptions = statusesQuery.data ?? [];

    const items = q.data?.content ?? [];
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);
    const totalElements = q.data?.totalElements ?? 0;

    if (q.isLoading && items.length === 0) {
        return (<View style={s.center}><ActivityIndicator size="large"/></View>);
    }
    if (q.isError) {
        return (<View style={s.center}><Text style={s.errorText}>Erro ao carregar os dados.</Text></View>);
    }
    if (items.length === 0) {
        return (<Text style={s.empty}>Nenhum registro encontrado.</Text>);
    }

    const verResultados = async (item: ApiItem) => {
        setLoadingResultados(true);
        try {
            const res = await api.get<Resultado[]>(`/api/basico/compromisso/${item.id}/resultados`);
            setResultadosModal({id: item.id, list: res.data ?? []});
        } catch (error) {
            Alert.alert('Erro ao carregar resultados', apiErrorMessage(error));
        } finally {
            setLoadingResultados(false);
        }
    };

    const trocarStatus = async (item: ApiItem, status: StatusOption) => {
        await api.put(`/api/basico/compromisso/${item.id}/troca-status`, {statusId: status.id});
        Alert.alert('Sucesso', `Status do compromisso #${item.id} alterado para ${status.descricao ?? status.id}.`);
        setTrocaStatusItem(null);
        q.refetch();
    };

    const confirmarTrocaStatus = (status: StatusOption) => {
        if (!trocaStatusItem) return;
        Alert.alert(
            'Troca de Status',
            `Alterar o status do compromisso #${trocaStatusItem.id} para ${status.descricao ?? status.id}?`,
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Confirmar',
                    onPress: () => trocarStatus(trocaStatusItem, status).catch((error) => {
                        Alert.alert('Erro ao trocar status', apiErrorMessage(error));
                    }),
                },
            ],
        );
    };

    const proximoStatus = async (item: ApiItem) => {
        Alert.alert(
            'Próximo Status',
            `Alterar o status do compromisso #${item.id} para o próximo status?`,
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Confirmar',
                    onPress: () => {
                        api.put(`/api/basico/compromisso/${item.id}/proximo-status`, {observacao: null})
                            .then(() => {
                                Alert.alert('Sucesso', `Status do compromisso #${item.id} alterado.`);
                                q.refetch();
                            })
                            .catch((error) => Alert.alert('Erro ao alterar status', apiErrorMessage(error)));
                    },
                },
            ],
        );
    };

    const fechar = (item: ApiItem) => {
        Alert.alert(
            'Fechar Compromisso',
            `Deseja realmente fechar o compromisso #${item.id}?`,
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Fechar',
                    style: 'destructive',
                    onPress: () => {
                        api.put(`/api/basico/compromisso/${item.id}/fechar`, {})
                            .then(() => {
                                Alert.alert('Sucesso', `Compromisso #${item.id} fechado.`);
                                q.refetch();
                            })
                            .catch((error) => Alert.alert('Erro ao fechar compromisso', apiErrorMessage(error)));
                    },
                },
            ],
        );
    };

    const renderRowActions = (item: ApiItem) => {
        const r = rec(item);
        const buttons = [];
        if (r.observacao) {
            buttons.push(
                <Pressable
                    key="observacao"
                    style={s.rowButton}
                    onPress={() => Alert.alert('Observação', String(r.observacao))}
                >
                    <Text style={s.rowButtonText}>📝 Observação</Text>
                </Pressable>,
            );
        }
        if (r.tem_resultados) {
            buttons.push(
                <Pressable
                    key="resultados"
                    style={s.rowButton}
                    onPress={() => verResultados(item)}
                >
                    <Text style={s.rowButtonText}>🔍 Resultados</Text>
                </Pressable>,
            );
        }
        if (r.ativo !== false && r.id_prospecto !== null && r.id_prospecto !== undefined) {
            buttons.push(
                <Pressable
                    key="prospecto"
                    style={s.rowButton}
                    onPress={() => Alert.alert('Prospecto', `Prospecto #${String(r.id_prospecto)} vinculado ao compromisso #${item.id}.`)}
                >
                    <Text style={s.rowButtonText}>🎯 Prospecto</Text>
                </Pressable>,
            );
        }
        if (canCreate) {
            buttons.push(
                <Pressable
                    key="trocaStatus"
                    style={s.rowButton}
                    onPress={() => setTrocaStatusItem(item)}
                >
                    <Text style={s.rowButtonText}>🔁 Troca Status</Text>
                </Pressable>,
            );
        }
        if (canUpdate && r.id_prox_status_compromisso !== null && r.id_prox_status_compromisso !== undefined) {
            buttons.push(
                <Pressable
                    key="proximoStatus"
                    style={s.rowButton}
                    onPress={() => proximoStatus(item)}
                >
                    <Text style={s.rowButtonText}>➡️ Próximo</Text>
                </Pressable>,
            );
        }
        if (canDelete && r.ativo !== false) {
            buttons.push(
                <Pressable
                    key="fechar"
                    style={[s.rowButton, s.dangerButton]}
                    onPress={() => fechar(item)}
                >
                    <Text style={s.rowButtonText}>✕ Fechar</Text>
                </Pressable>,
            );
        }
        return buttons;
    };

    return (
        <View style={s.page}>
            <FlatList
                data={items}
                keyExtractor={(item) => String(item.id)}
                refreshing={q.isFetching}
                onRefresh={() => q.refetch()}
                renderItem={({item}) => {
                    const r = rec(item);
                    return (
                        <View style={s.row}>
                            <Text style={s.rowTitle}>#{item.id} · {String(r.descricao ?? '')}</Text>
                            <Text style={s.rowSub}>Agendou: {String(r.usuario_descricao ?? '')}</Text>
                            <Text style={s.rowSub}>Consultor: {String(r.atendente_descricao ?? '')} · Finalizou: {String(r.usuario_finalizou_descricao ?? '')}</Text>
                            <Text style={s.rowSub}>Agenda: {String(r.agenda_descricao ?? '')}</Text>
                            <Text style={s.rowSub}>Tipo Agenda: {String(r.tipo_agenda_descricao ?? '')}</Text>
                            <Text style={s.rowSub}>Data: {formatDate(r.data)} · Horário: {String(r.horario_hora ?? '')}</Text>
                            <Text style={s.rowSub}>Status: {String(r.status_compromisso_descricao ?? '')}</Text>
                            {r.ativo === false ? <Text style={[s.rowSub, {color: '#a61b29'}]}>Fechado</Text> : null}
                            <View style={s.rowActions}>{renderRowActions(item)}</View>
                        </View>
                    );
                }}
                ListFooterComponent={
                    <View style={s.paginator}>
                        <Pressable
                            style={[s.pageButton, (page === 0 || q.isFetching) && s.pageButtonDisabled]}
                            disabled={page === 0 || q.isFetching}
                            onPress={() => setPage((c) => Math.max(0, c - 1))}
                        >
                            <Text style={s.pageButtonText}>Anterior</Text>
                        </Pressable>
                        <Text style={s.pageInfo}>Página {page + 1} de {totalPages} · Total: {totalElements}</Text>
                        <Pressable
                            style={[s.pageButton, (page >= totalPages - 1 || q.isFetching) && s.pageButtonDisabled]}
                            disabled={page >= totalPages - 1 || q.isFetching}
                            onPress={() => setPage((c) => Math.min(totalPages - 1, c + 1))}
                        >
                            <Text style={s.pageButtonText}>Próxima</Text>
                        </Pressable>
                    </View>
                }
            />

            {trocaStatusItem && (
                <Modal visible transparent animationType="fade" onRequestClose={() => setTrocaStatusItem(null)}>
                    <Pressable style={s.modalOverlay} onPress={() => setTrocaStatusItem(null)}>
                        <Pressable style={s.modalBox} onPress={(e) => e.stopPropagation()}>
                            <Text style={s.modalTitle}>Troca de Status - #{trocaStatusItem.id}</Text>
                            {statusOptions.length === 0 ? (
                                <Text style={s.modalEmpty}>Nenhum status disponível.</Text>
                            ) : (
                                <FlatList
                                    data={statusOptions}
                                    keyExtractor={(option) => String(option.id)}
                                    renderItem={({item: option}) => (
                                        <Pressable style={s.statusOption} onPress={() => confirmarTrocaStatus(option)}>
                                            <Text style={s.statusOptionText}>{option.descricao ?? `#${option.id}`}</Text>
                                        </Pressable>
                                    )}
                                />
                            )}
                            <Pressable style={[s.rowButton, s.cancelButton]} onPress={() => setTrocaStatusItem(null)}>
                                <Text style={s.cancelButtonText}>Cancelar</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}

            {resultadosModal && (
                <Modal visible transparent animationType="fade" onRequestClose={() => setResultadosModal(null)}>
                    <Pressable style={s.modalOverlay} onPress={() => setResultadosModal(null)}>
                        <Pressable style={s.modalBox} onPress={(e) => e.stopPropagation()}>
                            <Text style={s.modalTitle}>Resultados do Compromisso #{resultadosModal.id}</Text>
                            {loadingResultados ? (
                                <View style={s.center}><ActivityIndicator/></View>
                            ) : resultadosModal.list.length === 0 ? (
                                <Text style={s.modalEmpty}>Nenhum resultado vinculado.</Text>
                            ) : (
                                resultadosModal.list.map((r) => (
                                    <Text key={r.id} style={s.statusOptionText}>• {r.descricao}</Text>
                                ))
                            )}
                            <Pressable style={[s.rowButton, s.cancelButton]} onPress={() => setResultadosModal(null)}>
                                <Text style={s.cancelButtonText}>Fechar</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f5f5f5', padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
    errorText: {color: '#a61b29', fontSize: 14, marginBottom: 8},
    empty: {textAlign: 'center', color: '#666', marginTop: 24, fontSize: 14},
    row: {backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 8},
    rowTitle: {fontSize: 14, fontWeight: 'bold', color: '#222'},
    rowSub: {fontSize: 13, color: '#444', marginTop: 2},
    rowActions: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 8},
    rowButton: {backgroundColor: '#2a5a8815', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, marginTop: 4},
    rowButtonText: {color: '#2a5a88', fontSize: 13, fontWeight: '600'},
    dangerButton: {backgroundColor: '#a61b2915'},
    paginator: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0'},
    pageButton: {backgroundColor: '#2a5a8815', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6},
    pageButtonDisabled: {opacity: 0.4},
    pageButtonText: {color: '#2a5a88', fontSize: 13, fontWeight: '600'},
    pageInfo: {fontSize: 12, color: '#666', flexShrink: 1, textAlign: 'center', marginHorizontal: 8},
    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16},
    modalBox: {backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%'},
    modalTitle: {fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 12},
    modalEmpty: {color: '#666', marginVertical: 12, textAlign: 'center'},
    statusOption: {paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee'},
    statusOptionText: {fontSize: 14, color: '#2a5a88', paddingVertical: 4},
    cancelButton: {alignSelf: 'flex-end', marginTop: 12},
    cancelButtonText: {color: '#2a5a88', fontSize: 14, fontWeight: '600'},
});