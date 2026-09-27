import React, {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {Alert} from '../../../shared/components/SweetAlert';
import {api} from '../../../shared/services/api';
import {META_DINAMICA_API, META_DINAMICA_LIST_SOURCE, mesLabel, num, rec, str} from './metaDinamica';
import type {ApiItem, PagedResponse} from '../../../shared/types/types';

const PAGE_SIZE = 10;

export default function ViewMetaListMetaDinamicaListScreen() {
    const navigation = useNavigation();
    const [page, setPage] = useState(0);
    const [busca, setBusca] = useState('');

    const q = useQuery({
        queryKey: ['mobile', 'metaDinamicaList', page],
        queryFn: async () => {
            const {data} = await api.get<PagedResponse<ApiItem>>(`${META_DINAMICA_LIST_SOURCE}/paged`, {
                params: {page, size: PAGE_SIZE},
            });
            return data;
        },
    });

    const items = useMemo(() => q.data?.content ?? [], [q.data]);
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);
    const totalElements = q.data?.totalElements ?? 0;

    const filtrados = useMemo(() => {
        const term = busca.trim().toLowerCase();
        if (!term) return items;
        return items.filter((item) => {
            const row = rec(item);
            return [row.indicador_nome, row.unidade_sucinto, row.ano, mesLabel(row.mes)]
                .some((valor) => str(valor).toLowerCase().includes(term));
        });
    }, [items, busca]);

    const remover = useCallback(async (id: number) => {
        try {
            await api.delete(`${META_DINAMICA_API}/${id}`);
            q.refetch();
        } catch (e) {
            console.error('Erro ao excluir meta dinâmica:', e);
            Alert.alert('Erro', 'Erro ao excluir a meta dinâmica.');
        }
    }, [q]);

    if (q.isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large"/>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Meta Dinâmica</Text>
                <Pressable
                    style={styles.novo}
                    onPress={() => navigation.navigate('view/meta/formMetaDinamica' as never)}
                >
                    <Text style={styles.novoTexto}>Nova</Text>
                </Pressable>
            </View>

            <TextInput
                style={styles.busca}
                placeholder="Buscar por indicador, unidade, ano ou mês..."
                value={busca}
                onChangeText={setBusca}
            />

            {filtrados.length === 0 ? (
                <Text style={styles.vazio}>Nenhum registro encontrado.</Text>
            ) : (
                <FlatList
                    data={filtrados}
                    keyExtractor={(item) => String(item.id)}
                    refreshing={q.isFetching}
                    onRefresh={() => q.refetch()}
                    renderItem={({item}) => {
                        const row = rec(item);
                        const metaId = num(row.id) ?? 0;
                        return (
                            <View style={styles.card}>
                                <View style={styles.cardMain}>
                                    <Text style={styles.cardTitulo}>{str(row.indicador_nome)}</Text>
                                    <Text style={styles.cardSub}>{str(row.unidade_sucinto)}</Text>
                                    <Text style={styles.cardDetalhe}>
                                        {mesLabel(row.mes) || 'Todos os meses'}{str(row.ano) ? ` • ${str(row.ano)}` : ''}
                                    </Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <Pressable
                                        onPress={() => navigation.navigate(
                                            'view/meta/formMetaDinamica' as never,
                                            {id: String(metaId)} as never,
                                        )}
                                    >
                                        <Text style={styles.acao}>Editar</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => Alert.alert(
                                            'Excluir registro',
                                            `Deseja realmente excluir a meta #${metaId}?`,
                                            [
                                                {text: 'Cancelar', style: 'cancel'},
                                                {text: 'Excluir', style: 'destructive', onPress: () => void remover(metaId)},
                                            ],
                                        )}
                                    >
                                        <Text style={[styles.acao, styles.acaoPerigo]}>Excluir</Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            <View style={styles.paginator}>
                <Pressable
                    style={[styles.pagina, (page === 0 || q.isFetching) && styles.paginaDesabilitada]}
                    disabled={page === 0 || q.isFetching}
                    onPress={() => setPage((atual) => Math.max(0, atual - 1))}
                >
                    <Text style={styles.paginaTexto}>Anterior</Text>
                </Pressable>
                <Text style={styles.paginaInfo}>Página {page + 1} de {totalPages} • Total: {totalElements}</Text>
                <Pressable
                    style={[styles.pagina, (page >= totalPages - 1 || q.isFetching) && styles.paginaDesabilitada]}
                    disabled={page >= totalPages - 1 || q.isFetching}
                    onPress={() => setPage((atual) => Math.min(totalPages - 1, atual + 1))}
                >
                    <Text style={styles.paginaTexto}>Próxima</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f5f5f5'},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    title: {fontSize: 20, fontWeight: '700', color: '#1f2d3d'},
    novo: {backgroundColor: '#2a5a88', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8},
    novoTexto: {color: '#fff', fontWeight: '700'},
    busca: {
        margin: 16,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: '#ccd3db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        fontSize: 14,
    },
    vazio: {textAlign: 'center', color: '#8a94a0', marginTop: 32, fontSize: 15},
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 10,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e4e9',
        backgroundColor: '#fff',
    },
    cardMain: {flex: 1},
    cardTitulo: {fontSize: 15, fontWeight: '600', color: '#1f2d3d'},
    cardSub: {fontSize: 13, color: '#55606e', marginTop: 2},
    cardDetalhe: {fontSize: 12, color: '#8a94a0', marginTop: 2},
    cardActions: {gap: 10, alignItems: 'flex-end'},
    acao: {fontSize: 14, fontWeight: '600', color: '#2a5a88'},
    acaoPerigo: {color: '#a61b29'},
    paginator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    pagina: {
        backgroundColor: '#e3ebf3',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    paginaDesabilitada: {opacity: 0.4},
    paginaTexto: {color: '#2a5a88', fontWeight: '600', fontSize: 13},
    paginaInfo: {fontSize: 12, color: '#55606e', flexShrink: 1, textAlign: 'center', marginHorizontal: 8},
});
