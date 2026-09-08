import React, {useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {Tabs} from '../../Tabs';
import {executeAction} from '../../shared/services/actions';
import type {ApiItem, PagedResponse} from '../../shared/types/types';

interface EtapaCobranca {
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

const formatValor = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return n.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
};

const PAGE_SIZE = 20;

function EtapaList({etapaId}: {etapaId: number}) {
    const [page, setPage] = useState(0);
    const q = useQuery({
        queryKey: ['ligacao-cobranca', etapaId, page],
        queryFn: async () => (await api.get<PagedResponse<ApiItem>>('/api/financeiro/ligacao-cobranca/paged', {
            params: {page, size: PAGE_SIZE, etapasCobrancaId: etapaId},
        })).data,
    });
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

    return (
        <View>
            <FlatList
                data={items}
                keyExtractor={(item) => String(item.id)}
                refreshing={q.isFetching}
                onRefresh={() => q.refetch()}
                renderItem={({item}) => {
                    const r = rec(item);
                    return (
                        <View style={s.row}>
                            <Text style={s.rowTitle}>Contrato {String(r.contratoId ?? '')} #{item.id}</Text>
                            <Text style={s.rowSub}>Telefone: {String(r.telefone ?? '')}</Text>
                            <Text style={s.rowSub}>Início: {formatDate(r.dataInicial)} · Fim: {formatDate(r.dataFinal)}</Text>
                            <Text style={s.rowSub}>Resultado: {String(r.resultadoCobrancaId ?? '')} · Parcelas: {String(r.qtdeParcela ?? '')}</Text>
                            <Text style={s.rowSub}>Valor: {formatValor(r.valor)}</Text>
                            {r.observacao ? <Text style={s.rowSub}>Obs.: {String(r.observacao)}</Text> : null}
                            <View style={s.rowActions}>
                                <Pressable
                                    style={s.rowButton}
                                    onPress={() => executeAction('ligacao-cobranca', 'carregarDetalhes', 'view/cobranca/listLigacaoCobranca/actions', JSON.stringify({contrato: r.contratoId ?? (r as Record<string, unknown>).contrato}))}
                                >
                                    <Text style={s.rowButtonText}>ℹ️ Detalhes</Text>
                                </Pressable>
                                <Pressable
                                    style={s.rowButton}
                                    onPress={() => executeAction('ligacao-cobranca', 'iniciarLigacao', 'view/cobranca/listLigacaoCobranca/actions', JSON.stringify({cobranca: item.id, contrato: r.contratoId}))}
                                >
                                    <Text style={s.rowButtonText}>📞 Ligação</Text>
                                </Pressable>
                                <Pressable
                                    style={s.rowButton}
                                    onPress={() => executeAction('ligacao-cobranca', 'prepararEnvioEmail', 'view/cobranca/listLigacaoCobranca/actions', JSON.stringify({id: item.id}))}
                                >
                                    <Text style={s.rowButtonText}>✉️ E-mail</Text>
                                </Pressable>
                            </View>
                        </View>
                    );
                }}
            />
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
        </View>
    );
}

export default function ViewCobrancaListLigacaoCobrancaListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-cobranca'],
        queryFn: async () => (await api.get<EtapaCobranca[]>('/api/financeiro/etapas-cobranca')).data,
    });
    const etapas = etapasQuery.data ?? [];

    if (etapasQuery.isLoading && etapas.length === 0) {
        return (
            <View style={s.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    return (
        <View style={s.page}>
            {etapasQuery.isError ? <Text style={s.errorText}>Erro ao carregar as etapas.</Text> : null}
            <Tabs
                tabs={etapas.map((etapa) => ({
                    key: String(etapa.id),
                    label: etapa.descricao || `Etapa ${etapa.id}`,
                    content: <EtapaList etapaId={etapa.id}/>,
                }))}
            />
        </View>
    );
}

const s = StyleSheet.create({
    page: {flex: 1, padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    errorText: {color: '#a61b29', fontSize: 14, marginBottom: 8},
    empty: {textAlign: 'center', color: '#666', marginTop: 24, fontSize: 14},
    row: {backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 8},
    rowTitle: {fontSize: 14, fontWeight: 'bold', color: '#222'},
    rowSub: {fontSize: 13, color: '#444', marginTop: 2},
    rowActions: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 8},
    rowButton: {backgroundColor: '#2a5a8815', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, marginTop: 4},
    rowButtonText: {color: '#2a5a88', fontSize: 13, fontWeight: '600'},
    paginator: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0'},
    pageButton: {backgroundColor: '#2a5a8815', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6},
    pageButtonDisabled: {opacity: 0.4},
    pageButtonText: {color: '#2a5a88', fontSize: 13, fontWeight: '600'},
    pageInfo: {fontSize: 12, color: '#666', flexShrink: 1, textAlign: 'center', marginHorizontal: 8},
});
