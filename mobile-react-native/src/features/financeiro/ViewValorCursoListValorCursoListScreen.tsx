import React, {useState} from 'react';
import {ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import type {ApiItem, PagedResponse} from '../../shared/types/types';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../../shared/styles/theme';

const LIST_PATH = '/api/view/valorCurso/listValorCurso';
const FORM_SCREEN = 'view/valorCurso/formValorCurso';
const PAGE_SIZE = 20;

const rec = (item: unknown): Record<string, unknown> =>
    (item && typeof item === 'object' ? item as Record<string, unknown> : {});

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    return m ? `${m[3]}/${m[2]}/${m[1]}` : String(value);
};

const formatValor = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return n.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
};

export default function ViewValorCursoListValorCursoListScreen({navigation}: {navigation?: any}) {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);

    const q = useQuery({
        queryKey: [LIST_PATH, page],
        queryFn: async () => (await api.get<PagedResponse<ApiItem>>(`${LIST_PATH}/paged`, {params: {page, size: PAGE_SIZE}})).data,
    });
    const items = q.data?.content ?? [];
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);
    const totalElements = q.data?.totalElements ?? 0;

    const novo = () => {
        if (navigation?.navigate) navigation.navigate(FORM_SCREEN as never);
    };
    const editar = (id: number) => {
        if (navigation?.navigate) navigation.navigate(FORM_SCREEN as never, {id} as never);
    };
    const excluir = (id: number) => {
        Alert.alert('Confirmar', `Excluir valor do curso ${id}?`, [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Excluir', style: 'destructive', onPress: async () => {
                try {
                    await api.delete(`/api/financeiro/valor-curso/${id}`);
                    queryClient.invalidateQueries({queryKey: [LIST_PATH]});
                } catch (e) {
                    Alert.alert('Erro', 'Erro ao excluir registro.');
                }
            }},
        ]);
    };

    if (q.isLoading && items.length === 0) {
        return (<View style={s.center}><ActivityIndicator color={Colors.primary} size="large"/></View>);
    }
    if (q.isError) {
        return (<View style={s.center}><Text style={s.errorText}>Erro ao carregar valores de curso.</Text></View>);
    }

    return (
        <View style={s.page}>
            <View style={s.header}>
                <Text style={s.title}>Valor Curso</Text>
                <Pressable style={[s.btn, s.btnNew]} onPress={novo}><Text style={s.btnText}>+ Novo</Text></Pressable>
            </View>
            {items.length === 0 ? (
                <Text style={s.empty}>Nenhum registro encontrado.</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    refreshing={q.isFetching}
                    onRefresh={() => q.refetch()}
                    renderItem={({item}) => {
                        const r = rec(item);
                        const porHora = r.valor_hora === true;
                        return (
                            <View style={s.row}>
                                <View style={s.rowContent}>
                                    <Text style={s.rowTitle}>{String(r.curriculo_descricao ?? r.curriculo ?? r.curso_descricao ?? `#${item.id}`)}</Text>
                                    <Text style={s.rowSub}>Data: {formatDate(r.data)} · {porHora ? 'Valor Hora' : 'Valor Curso'}: {formatValor(r.valor)}{porHora ? ' (por hora)' : ''}</Text>
                                    <Text style={s.rowSub}>Dias SPC: {String(r.dias_spc ?? '')} · Tol. multa: {String(r.dias_tolerancia_multa ?? '')}</Text>
                                    <Text style={s.rowSub}>Descontos: {String(r.descontos ?? r.desconto_descricao ?? r.desconto ?? '-')}</Text>
                                    <Text style={s.rowSub}>Forma Pagamento: {String(r.formas_pagamento ?? r.forma_pagamento ?? '-')}</Text>
                                    <Text style={s.rowSub}>Taxas: {String(r.taxas ?? r.taxa_descricao ?? '-')}</Text>
                                    <Text style={s.rowSub}>Unidades: {String(r.unidades ?? r.unidade_descricao ?? '-')}</Text>
                                </View>
                                <View style={s.rowActions}>
                                    <Pressable style={[s.actionBtn, s.actionEdit]} onPress={() => editar(item.id)}>
                                        <Text style={s.actionText}>Editar</Text>
                                    </Pressable>
                                    <Pressable style={[s.actionBtn, s.actionDelete]} onPress={() => excluir(item.id)}>
                                        <Text style={s.actionText}>Excluir</Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
            <View style={s.paginator}>
                <Pressable
                    style={[s.pageButton, (page === 0 || q.isFetching) && s.pageButtonDisabled]}
                    disabled={page === 0 || q.isFetching}
                    onPress={() => setPage((c) => Math.max(0, c - 1))}>
                    <Text style={s.pageButtonText}>Anterior</Text>
                </Pressable>
                <Text style={s.pageInfo}>Página {page + 1} de {totalPages} · Total: {totalElements}</Text>
                <Pressable
                    style={[s.pageButton, (page >= totalPages - 1 || q.isFetching) && s.pageButtonDisabled]}
                    disabled={page >= totalPages - 1 || q.isFetching}
                    onPress={() => setPage((c) => Math.min(totalPages - 1, c + 1))}>
                    <Text style={s.pageButtonText}>Próxima</Text>
                </Pressable>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    page:{flex:1, backgroundColor:Colors.bgPrimary, padding:Spacing.lg},
    center:{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:Colors.bgPrimary, padding:Spacing.xl},
    errorText:{color:Colors.error, fontSize:Typography.sizes.lg, fontWeight:Typography.weights.semibold, textAlign:'center'},
    header:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:Spacing.md, paddingHorizontal:Spacing.md, paddingVertical:Spacing.sm, backgroundColor:Colors.bgSecondary, borderRadius:BorderRadius.lg, borderWidth:1, borderColor:Colors.borderLight},
    title:{fontSize:Typography.sizes.xl, fontWeight:Typography.weights.bold, color:Colors.textPrimary},
    btn:{borderRadius:BorderRadius.md, paddingHorizontal:Spacing.md, paddingVertical:Spacing.sm, alignItems:'center', ...Shadows.small},
    btnNew:{backgroundColor:Colors.btnGreen},
    btnText:{color:Colors.textWhite, fontWeight:Typography.weights.bold, fontSize:13},
    empty:{textAlign:'center', color:Colors.textLight, marginTop:Spacing.xl, fontSize:Typography.sizes.base},
    row:{backgroundColor:Colors.bgSecondary, borderRadius:BorderRadius.lg, padding:Spacing.md, borderWidth:1, borderColor:Colors.borderLight, marginBottom:Spacing.sm},
    rowContent:{gap:2},
    rowTitle:{fontSize:Typography.sizes.base, fontWeight:Typography.weights.bold, color:Colors.textPrimary},
    rowSub:{fontSize:Typography.sizes.sm, color:Colors.textSecondary},
    rowActions:{flexDirection:'row', gap:8, marginTop:Spacing.sm},
    actionBtn:{borderRadius:BorderRadius.md, paddingHorizontal:Spacing.md, paddingVertical:6},
    actionEdit:{backgroundColor:Colors.primary},
    actionDelete:{backgroundColor:Colors.error},
    actionText:{color:Colors.textWhite, fontSize:12, fontWeight:Typography.weights.bold},
    paginator:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:Spacing.md, paddingTop:Spacing.md, borderTopWidth:1, borderColor:Colors.borderLight},
    pageButton:{backgroundColor:Colors.primary + '15', borderRadius:BorderRadius.md, paddingHorizontal:Spacing.md, paddingVertical:6},
    pageButtonDisabled:{opacity:0.4},
    pageButtonText:{color:Colors.primary, fontSize:Typography.sizes.base, fontWeight:Typography.weights.semibold},
    pageInfo:{fontSize:Typography.sizes.sm, color:Colors.textMuted, flexShrink:1, textAlign:'center', marginHorizontal:Spacing.sm},
});
