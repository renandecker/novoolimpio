import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Alert} from '../../shared/components/SweetAlert';
import {RowMenu} from '../../shared/components/RowMenu';
import {useNavigation} from '@react-navigation/native';
import {api} from '../../shared/services/api';

const asRecord = (item: any) => item as Record<string, any>;

const fmtData = (valor: unknown) => (valor ? String(valor).slice(0, 10) : '');

/**
 * Lista os Grupos ("Oferecimento Curso") e permite escolher os oferecimentos
 * (turmas) que serão editados no formulário, seguindo as mesmas três ordens do
 * aceso: início do oferecimento, listagem da tabela ou conforme selecionando.
 */
export default function ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen() {
    const navigation = useNavigation<any>();

    const [page, setPage] = useState(0);
    const [items, setItems] = useState<any[] | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [dialog, setDialog] = useState<{open: boolean; grupoId: number | null}>({open: false, grupoId: null});
    const [oferecimentos, setOferecimentos] = useState<any[]>([]);
    const [oferecimentosLoading, setOferecimentosLoading] = useState(false);
    const [selecionados, setSelecionados] = useState<number[]>([]);

    const load = useCallback(async (targetPage: number) => {
        try {
            const {data} = await api.get('/api/educacao/oferecimento-curso/paged', {
                params: {page: targetPage, size: 10},
            });
            setItems(data?.content ?? []);
            setTotalPages(Math.max(1, data?.totalPages ?? 1));
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível carregar os oferecimentos de curso.');
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        load(page).finally(() => setLoading(false));
    }, [page, load]);

    const abrirSelecao = useCallback(async (grupoId: number) => {
        setSelecionados([]);
        setOferecimentos([]);
        setOferecimentosLoading(true);
        setDialog({open: true, grupoId});
        try {
            const {data} = await api.get('/api/educacao/oferecimento-curso/listar-oferecimentos', {params: {grupoId}});
            setOferecimentos(Array.isArray(data) ? data : []);
        } catch (e) {
            setOferecimentos([]);
        } finally {
            setOferecimentosLoading(false);
        }
    }, []);

    const toggleSelect = (id: number) => {
        setSelecionados(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    };

    const fecharSelecao = () => {
        setDialog({open: false, grupoId: null});
        setSelecionados([]);
    };

    const irParaEdicao = (ids: number[]) => {
        const grupoId = dialog.grupoId;
        if (grupoId == null) return;
        navigation.navigate('view/oferecimentoComponenteCurricular/formOferecimentoCurso', {
            id: grupoId,
            ordem: ids.join(','),
        });
        fecharSelecao();
    };

    const ordenarPorInicioOferecimento = () => {
        if (selecionados.length === 0) {
            Alert.alert('Atenção', 'Selecione algum oferecimento para editar.');
            return;
        }
        const ordenados = oferecimentos
            .filter(o => selecionados.includes(Number(asRecord(o).id)))
            .sort(
                (a, b) =>
                    new Date(String(asRecord(a).dataInicio ?? '')).getTime() -
                    new Date(String(asRecord(b).dataInicio ?? '')).getTime(),
            );
        irParaEdicao(ordenados.map(o => Number(asRecord(o).id)));
    };

    const ordenarPorListagemTabela = () => {
        if (oferecimentos.length === 0) {
            Alert.alert('Atenção', 'Não existem oferecimentos cadastrados para este grupo.');
            return;
        }
        irParaEdicao(oferecimentos.map(o => Number(asRecord(o).id)));
    };

    const ordenarPorSelecionado = () => {
        if (selecionados.length === 0) {
            Alert.alert('Atenção', 'Selecione algum oferecimento para editar.');
            return;
        }
        irParaEdicao([...selecionados]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2a5a88"/>
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    if (!items) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Erro ao carregar os oferecimentos de curso.</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Oferecimento Curso</Text>
            </View>

            {items.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.empty}>Nenhum registro encontrado.</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(asRecord(item).id)}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        load(page).finally(() => setRefreshing(false));
                    }}
                    contentContainerStyle={{padding: 12, gap: 10}}
                    renderItem={({item}) => {
                        const record = asRecord(item);
                        const id = Number(record.id);
                        return (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>#{id} — {String(record.nome ?? '')}</Text>
                                <Text style={styles.cardSub}>
                                    {String(record.unidade_sucinto ?? '')} • {String(record.curso_nome ?? '')}
                                </Text>
                                  <View style={styles.cardActions}>
                                      <RowMenu
                                          icon={<Text style={{fontSize: 20}}>✏️</Text>}
                                          className="btngreen"
                                          title="Editar"
                                          items={[
                                              {key: 'selecionar', label: 'Selecionar Oferecimentos para Editar', className: 'btnblue', onSelect: () => abrirSelecao(id)},
                                              {key: 'editarTodos', label: 'Editar Todos', className: 'btngreen', onSelect: () => navigation.navigate('view/oferecimentoComponenteCurricular/formOferecimentoCurso', {id})},
                                          ]}
                                      />
                                  </View>
                            </View>
                        );
                    }}
                />
            )}

            <View style={styles.pager}>
                <Pressable style={[styles.pagerBtn, page === 0 && styles.disabled]} disabled={page === 0} onPress={() => setPage(p => Math.max(0, p - 1))}>
                    <Text style={styles.pagerText}>Anterior</Text>
                </Pressable>
                <Text style={styles.pagerInfo}>Página {page + 1} de {totalPages}</Text>
                <Pressable
                    style={[styles.pagerBtn, page >= totalPages - 1 && styles.disabled]}
                    disabled={page >= totalPages - 1}
                    onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                >
                    <Text style={styles.pagerText}>Próxima</Text>
                </Pressable>
            </View>

            <Modal visible={dialog.open} transparent animationType="fade" onRequestClose={fecharSelecao}>
                <Pressable style={styles.overlay} onPress={fecharSelecao}>
                    <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecione oferecimentos para edição</Text>
                            <Pressable style={styles.closeBtn} onPress={fecharSelecao} accessibilityLabel="Fechar">
                                <Text style={styles.closeBtnText}>✕</Text>
                            </Pressable>
                        </View>
                        {oferecimentosLoading ? (
                            <View style={styles.center}>
                                <ActivityIndicator size="large" color="#2a5a88"/>
                            </View>
                        ) : oferecimentos.length === 0 ? (
                            <View style={styles.center}>
                                <Text style={styles.empty}>Nenhum oferecimento cadastrado para este grupo.</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.modalScroll}>
                                {oferecimentos.map((item) => {
                                    const record = asRecord(item);
                                    const itemId = Number(record.id);
                                    const isSelected = selecionados.includes(itemId);
                                    return (
                                        <Pressable key={itemId} style={styles.optionRow} onPress={() => toggleSelect(itemId)}>
                                            <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>
                                                {isSelected ? <Text style={styles.checkboxMark}>✓</Text> : null}
                                            </View>
                                            <View style={styles.optionTexts}>
                                                <Text style={styles.optionMain}>{record.componenteCurricular_descricao ?? `#${itemId}`}</Text>
                                                <Text style={styles.optionSub}>
                                                    Turma #{record.id} • {record.sala_descricao ?? 'Sem sala'} • {record.inscritos ?? 0}/{record.vagas ?? 0}
                                                </Text>
                                                <Text style={styles.optionSub}>
                                                    Início: {fmtData(record.dataInicio)} • Fim: {fmtData(record.dataFim)}
                                                    {record.dataCancelamento ? ` • Cancelado: ${fmtData(record.dataCancelamento)}` : ''}
                                                </Text>
                                                {record.professor_descricao ? (
                                                    <Text style={styles.optionSub}>Prof.: {record.professor_descricao}</Text>
                                                ) : null}
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        )}
                        <View style={styles.modalFooter}>
                            <Pressable style={[styles.btn, styles.btnBlue]} onPress={ordenarPorInicioOferecimento}>
                                <Text style={styles.btnText}>Ordem pelo início oferecimento</Text>
                            </Pressable>
                            <Pressable style={[styles.btn, styles.btnStop]} onPress={ordenarPorListagemTabela}>
                                <Text style={styles.btnText}>Ordem pela listagem tabela</Text>
                            </Pressable>
                            <Pressable style={[styles.btn, styles.btnGreen]} onPress={ordenarPorSelecionado}>
                                <Text style={styles.btnText}>Ordem conforme selecionando</Text>
                            </Pressable>
                            <Pressable style={[styles.btn, styles.btnCancel]} onPress={fecharSelecao}>
                                <Text style={styles.btnText}>Cancelar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f2f2f2'},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10},
    loadingText: {color: '#888', fontSize: 13},
    error: {color: '#8A1F1F', marginBottom: 12, fontWeight: '700'},
    empty: {color: '#888', fontStyle: 'italic'},
    header: {padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
    title: {fontSize: 18, fontWeight: '800', color: '#111'},
    card: {backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e5e7eb'},
    cardTitle: {fontWeight: '800', color: '#111', marginBottom: 4},
    cardSub: {color: '#555', marginBottom: 8},
    cardActions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    btn: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center'},
    btnBlue: {backgroundColor: '#2f5da8'},
    btnStop: {backgroundColor: '#6a4fa3'},
    btnGreen: {backgroundColor: '#2e7d32'},
    btnCancel: {backgroundColor: '#6b7280'},
    btnText: {color: '#fff', fontWeight: '700', fontSize: 13},
    pager: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    pagerBtn: {paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#2a5a88', borderRadius: 6},
    pagerText: {color: '#fff', fontWeight: '700'},
    pagerInfo: {color: '#374151', fontWeight: '600'},
    disabled: {opacity: 0.4},
    overlay: {flex: 1, backgroundColor: 'rgba(29, 32, 37, 0.55)', justifyContent: 'center', padding: 16},
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxHeight: '90%',
        overflow: 'hidden',
        shadowColor: '#1d2025',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#2f333b',
        borderBottomWidth: 3,
        borderBottomColor: '#c2aa3c',
    },
    modalTitle: {fontSize: 15, fontWeight: '600', color: '#fff', flexShrink: 1, marginRight: 8},
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {color: '#e8d27a', fontSize: 16, fontWeight: '500'},
    modalScroll: {padding: 12, flexGrow: 0},
    optionRow: {flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee'},
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#9ca3af',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    checkboxOn: {backgroundColor: '#2e7d32', borderColor: '#2e7d32'},
    checkboxMark: {color: '#fff', fontSize: 13, fontWeight: '800'},
    optionTexts: {flex: 1},
    optionMain: {fontWeight: '700', color: '#111'},
    optionSub: {color: '#555', fontSize: 12, marginTop: 2},
    modalFooter: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb'},
});