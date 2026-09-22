import React, {useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import {api} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';
import {Tabs} from '../../Tabs';
import {MasterDetail} from '../../MasterDetail';
import {
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH,
} from '../../masterDetailSources';
import type {ApiItem} from '../../shared/types/types';

interface PainelTopico {
    id?: number;
    painelId?: number;
    tabelaId?: number;
    graficoId?: number;
    mapaId?: number;
    ordem?: number;
}

const optionLabel = (item: any, fallbackKeys: string[] = ['nomeVisualizacao', 'nome']): string => {
    if (!item) return '';
    for (const key of fallbackKeys) {
        const value = item[key];
        if (typeof value === 'string' && value) return value;
    }
    return `#${String(item?.id ?? '')}`;
};

interface SelectFieldProps {
    label: string;
    options: any[];
    value?: number;
    placeholder?: string;
    onChange: (id?: number) => void;
}

function SelectField({label, options, value, placeholder, onChange}: SelectFieldProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const filtered = useMemo(
        () => options.filter((o) => optionLabel(o).toLowerCase().includes(query.trim().toLowerCase())),
        [options, query],
    );
    const selected = options.find((o) => o.id === value);

    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <Pressable style={styles.selectBox} onPress={() => setOpen((prev) => !prev)}>
                <Text style={selected ? styles.selectText : styles.selectPlaceholder}>
                    {selected ? optionLabel(selected) : placeholder ?? '-- Selecione --'}
                </Text>
                <Text style={styles.selectCaret}>{open ? '▲' : '▼'}</Text>
            </Pressable>
            {open && (
                <View style={styles.selectPanel}>
                    <TextInput
                        style={styles.input}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Buscar..."
                    />
                    <ScrollView style={styles.selectOptions} keyboardShouldPersistTaps="handled">
                        {filtered.map((o) => {
                            const active = o.id === value;
                            return (
                                <Pressable
                                    key={String(o.id)}
                                    style={[styles.selectOption, active && styles.selectOptionActive]}
                                    onPress={() => {
                                        onChange(o.id);
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    <Text style={[styles.selectOptionText, active && styles.selectOptionTextActive]}>
                                        {optionLabel(o)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                        {filtered.length === 0 && (
                            <Text style={styles.emptyOption}>Nenhum resultado encontrado</Text>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

function SegmentRow<T extends string | number>({
    options,
    value,
    onChange,
}: {
    options: {value: T; label: string}[];
    value?: T;
    onChange: (value: T) => void;
}) {
    return (
        <View style={styles.segmentRow}>
            {options.map((opt) => {
                const active = value === opt.value;
                return (
                    <Pressable
                        key={opt.value}
                        style={[styles.segment, active && styles.segmentActive]}
                        onPress={() => onChange(opt.value)}
                    >
                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default function ViewRelatoriosFormDashboardListScreen({
    route,
    navigation,
}: {
    route: {params?: {id?: number | string}};
    navigation: any;
}) {
    const idParam = route.params?.id != null ? Number(route.params.id) : null;
    const isEditing = idParam != null;

    const [entity, setEntity] = useState<{id?: number; nome?: string}>({});
    const [topicos, setTopicos] = useState<PainelTopico[]>([]);

    const [tabelas, setTabelas] = useState<any[]>([]);
    const [graficos, setGraficos] = useState<any[]>([]);
    const [mapas, setMapas] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);

    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);

    const [filtrosSelecionados, setFiltrosSelecionados] = useState<Set<number>>(new Set());

    const [adicionarTipo, setAdicionarTipo] = useState<'tabela' | 'grafico' | 'mapa'>('tabela');
    const [adicionarId, setAdicionarId] = useState<number | undefined>();

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const resp = await api.get<any[]>(`/api/relatorios/tabela`);
                if (Array.isArray(resp.data)) setTabelas(resp.data);
            } catch (err) {
                console.error('Erro ao carregar tabelas:', err);
            }
            try {
                const resp = await api.get<any[]>(`/api/relatorios/grafico`);
                if (Array.isArray(resp.data)) setGraficos(resp.data);
            } catch (err) {
                console.error('Erro ao carregar gráficos:', err);
            }
            try {
                const resp = await api.get<any[]>(`/api/relatorios/mapa`);
                if (Array.isArray(resp.data)) setMapas(resp.data);
            } catch (err) {
                console.error('Erro ao carregar mapas:', err);
            }
            try {
                const resp = await api.get<any[]>(API_PATHS.relatorios.filtro);
                if (Array.isArray(resp.data)) setFiltros(resp.data);
            } catch (err) {
                console.error('Erro ao carregar filtros:', err);
            }
        })();
    }, []);

    const resolveItems = async (source: string, ids: any[]): Promise<ApiItem[]> => {
        if (!Array.isArray(ids) || ids.length === 0) return [];
        const resp = await api.get<ApiItem[]>(source);
        const all = Array.isArray(resp.data) ? resp.data : [];
        const set = new Set(ids.map((x: any) => String(x.id ?? x)));
        return all.filter((item: any) => set.has(String(item.id)));
    };

    useEffect(() => {
        if (!isEditing || idParam == null) return;
        setLoading(true);
        (async () => {
            try {
                const resp = await api.get<any>(`/api/relatorios/painel/${idParam}`);
                const painel = resp.data;
                setEntity({id: painel.id, nome: painel.nome});
                const topicosList: PainelTopico[] = (painel.topicos ?? []).map((t: any) => ({
                    id: t.id,
                    painelId: t.painelId,
                    tabelaId: t.tabelaId,
                    graficoId: t.graficoId,
                    mapaId: t.mapaId,
                    ordem: t.ordem,
                }));
                setTopicos(topicosList.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));

                const [usu, uni, per] = await Promise.all([
                    resolveItems(USUARIO_SOURCE, painel.usuariosIds ?? []),
                    resolveItems(UNIDADE_SOURCE, painel.unidadesIds ?? []),
                    resolveItems(PERFIL_SOURCE, painel.perfisIds ?? []),
                ]);
                setUsuarios(usu);
                setUnidades(uni);
                setPerfis(per);

                if (Array.isArray(painel.filtrosIds)) {
                    setFiltrosSelecionados(new Set(painel.filtrosIds));
                }
            } catch (err) {
                console.error('Erro ao carregar painel:', err);
                Alert.alert('Erro', 'Não foi possível carregar o dashboard.');
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idParam, isEditing]);

    const garantirPainel = async (): Promise<number> => {
        if (entity.id) return entity.id;
        if (!entity.nome || entity.nome.trim().length < 3) {
            throw new Error('Informe o nome do dashboard (mínimo 3 caracteres) antes de adicionar itens.');
        }
        const resp = await api.post<any>(`/api/relatorios/painel`, {nome: entity.nome.trim()});
        setEntity((prev) => ({...prev, id: resp.data.id}));
        return resp.data.id;
    };

    const nomeDeTopico = (t: PainelTopico, tipo: 'tabela' | 'grafico' | 'mapa'): string => {
        const id = tipo === 'tabela' ? t.tabelaId : tipo === 'grafico' ? t.graficoId : t.mapaId;
        const list = tipo === 'tabela' ? tabelas : tipo === 'grafico' ? graficos : mapas;
        return id ? optionLabel(list.find((item) => item.id === id) ?? {id}) : '';
    };

    const tipoDeTopico = (t: PainelTopico): 'tabela' | 'grafico' | 'mapa' =>
        t.tabelaId ? 'tabela' : t.graficoId ? 'grafico' : t.mapaId ? 'mapa' : 'tabela';

    const addTopico = async () => {
        if (!adicionarId) {
            Alert.alert('Atenção', 'Selecione um item para adicionar.');
            return;
        }
        try {
            const painelId = await garantirPainel();
            const body: any = {painelId, ordem: topicos.length + 1};
            if (adicionarTipo === 'tabela') body.tabelaId = adicionarId;
            else if (adicionarTipo === 'grafico') body.graficoId = adicionarId;
            else body.mapaId = adicionarId;

            const resp = await api.post<any>(`/api/relatorios/painel-painel`, body);
            const novo = resp.data;
            setTopicos((prev) => [...prev, {
                id: novo.id,
                painelId: novo.painelId,
                tabelaId: novo.tabelaId,
                graficoId: novo.graficoId,
                mapaId: novo.mapaId,
                ordem: novo.ordem,
            }]);
            setAdicionarId(undefined);
        } catch (err: any) {
            console.error('Erro ao adicionar item:', err);
            Alert.alert('Erro', err?.message ?? 'Não foi possível adicionar o item.');
        }
    };

    const removerTopico = async (topico: PainelTopico) => {
        if (!topico.id) return;
        try {
            await api.delete(`/api/relatorios/painel-painel/${topico.id}`);
            setTopicos((prev) => prev.filter((t) => t.id !== topico.id));
        } catch (err) {
            console.error('Erro ao remover item:', err);
            Alert.alert('Erro', 'Não foi possível remover o item.');
        }
    };

    const moverTopico = async (index: number, direcao: -1 | 1) => {
        const alvo = index + direcao;
        if (alvo < 0 || alvo >= topicos.length) return;
        const atual = topicos[index];
        const outro = topicos[alvo];
        try {
            if (atual.id) await api.put(`/api/relatorios/painel-painel/${atual.id}`, {
                painelId: atual.painelId,
                tabelaId: atual.tabelaId,
                graficoId: atual.graficoId,
                mapaId: atual.mapaId,
                ordem: outro.ordem,
            });
            if (outro.id) await api.put(`/api/relatorios/painel-painel/${outro.id}`, {
                painelId: outro.painelId,
                tabelaId: outro.tabelaId,
                graficoId: outro.graficoId,
                mapaId: outro.mapaId,
                ordem: atual.ordem,
            });
            const lista = [...topicos];
            lista[index] = outro;
            lista[alvo] = atual;
            setTopicos(lista);
        } catch (err) {
            console.error('Erro ao reordenar item:', err);
            Alert.alert('Erro', 'Não foi possível reordenar o item.');
        }
    };

    const toggleFiltro = (filtroId: number) => {
        setFiltrosSelecionados((prev) => {
            const next = new Set(prev);
            if (next.has(filtroId)) next.delete(filtroId);
            else next.add(filtroId);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!entity.nome || entity.nome.trim().length < 3) {
            Alert.alert('Atenção', 'Nome deve ter pelo menos 3 caracteres.');
            return;
        }
        setSaving(true);
        try {
            let id = entity.id;
            if (isEditing && idParam != null) {
                await api.put(`/api/relatorios/painel/${idParam}`, {nome: entity.nome.trim()});
                id = idParam;
            } else if (!id) {
                id = await garantirPainel();
            }
            if (id == null) throw new Error('Sem id do dashboard');

            await api.put(`/api/relatorios/painel/${id}/permissoes`, {
                usuariosIds: usuarios.map((u: any) => Number(u.id)),
                unidadesIds: unidades.map((u: any) => Number(u.id)),
                perfisIds: perfis.map((p: any) => Number(p.id)),
            });

            await api.put(`/api/relatorios/painel/${id}/filtros`, {
                filtrosIds: Array.from(filtrosSelecionados),
            });

            Alert.alert('Sucesso', 'Dashboard salvo com sucesso!');
            navigation.goBack();
        } catch (err) {
            console.error('Erro ao salvar dashboard:', err);
            Alert.alert('Erro', 'Não foi possível salvar o dashboard.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.centerText}>Carregando...</Text>
            </View>
        );
    }

    const listasDisponiveis = adicionarTipo === 'tabela' ? tabelas : adicionarTipo === 'grafico' ? graficos : mapas;

    const tabDefinicao = (
        <View>
            <Text style={styles.splitSectionTitle}>Configuração Principal</Text>
            <Text style={styles.label}>Nome do Dashboard *</Text>
            <TextInput
                style={styles.input}
                value={entity.nome ?? ''}
                onChangeText={(v) => setEntity((prev) => ({...prev, nome: v}))}
                placeholder="Ex: Indicadores Gerenciais"
            />

            <Text style={styles.splitSectionTitle}>Painéis do Dashboard</Text>
            <Text style={styles.label}>Tipo de item</Text>
            <SegmentRow
                options={[
                    {value: 'tabela', label: 'Tabela'},
                    {value: 'grafico', label: 'Gráfico'},
                    {value: 'mapa', label: 'Mapa'},
                ]}
                value={adicionarTipo}
                onChange={(v) => {
                    setAdicionarTipo(v);
                    setAdicionarId(undefined);
                }}
            />
            <SelectField
                label="Relatório"
                options={listasDisponiveis}
                value={adicionarId}
                placeholder="-- Selecione --"
                onChange={setAdicionarId}
            />
            <Pressable
                style={[styles.actionButton, styles.addButton, !adicionarId && {opacity: 0.5}]}
                disabled={!adicionarId}
                onPress={() => void addTopico()}
            >
                <Text style={styles.addButtonText}>＋ Adicionar Item</Text>
            </Pressable>

            <Text style={styles.splitSectionTitle}>Itens do Dashboard</Text>
            {topicos.length === 0 && (
                <Text style={styles.help}>Nenhum item adicionado.</Text>
            )}
            {topicos.map((topico, index) => {
                const tipo = tipoDeTopico(topico);
                return (
                    <View key={String(topico.id ?? index)} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>{nomeDeTopico(topico, tipo) || `#${String(tipoDeTopico(topico))}`}</Text>
                            <Text style={styles.itemSubtitle}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)} · Ordem {topico.ordem}</Text>
                        </View>
                        <Pressable style={styles.itemMove} onPress={() => void moverTopico(index, -1)}>
                            <Text style={styles.itemMoveText}>▲</Text>
                        </Pressable>
                        <Pressable style={styles.itemMove} onPress={() => void moverTopico(index, 1)}>
                            <Text style={styles.itemMoveText}>▼</Text>
                        </Pressable>
                        <Pressable style={styles.itemRemove} onPress={() => void removerTopico(topico)}>
                            <Text style={styles.itemRemoveText}>−</Text>
                        </Pressable>
                    </View>
                );
            })}
        </View>
    );

    const permissaoSub = (
        <Tabs
            tabs={[
                {
                    key: 'usuarios',
                    label: 'Usuários',
                    content: (
                        <MasterDetail
                            label="Usuário"
                            source={USUARIO_SOURCE}
                            valueKey="id"
                            searchKeys={USUARIO_SEARCH}
                            columns={USUARIO_COLUMNS}
                            items={usuarios}
                            onChange={setUsuarios}
                        />
                    ),
                },
                {
                    key: 'unidades',
                    label: 'Unidades',
                    content: (
                        <MasterDetail
                            label="Unidade"
                            source={UNIDADE_SOURCE}
                            valueKey="id"
                            searchKeys={UNIDADE_SEARCH}
                            columns={UNIDADE_COLUMNS}
                            items={unidades}
                            onChange={setUnidades}
                        />
                    ),
                },
                {
                    key: 'perfis',
                    label: 'Perfis',
                    content: (
                        <MasterDetail
                            label="Perfil"
                            source={PERFIL_SOURCE}
                            valueKey="id"
                            searchKeys={PERFIL_SEARCH}
                            columns={PERFIL_COLUMNS}
                            items={perfis}
                            onChange={setPerfis}
                        />
                    ),
                },
            ]}
            initial="usuarios"
        />
    );

    const tabFiltros = (
        <View>
            <Text style={styles.label}>Filtros vinculados ao dashboard</Text>
            <Text style={styles.help}>
                Cada filtro existe de forma independente (menu de filtros). Marque abaixo os filtros que este dashboard deve exibir.
            </Text>
            {filtros.length === 0 ? (
                <Text style={styles.help}>Nenhum filtro cadastrado.</Text>
            ) : (
                filtros.map((filtro: any) => {
                    const checked = filtrosSelecionados.has(Number(filtro.id));
                    return (
                        <Pressable
                            key={String(filtro.id)}
                            style={styles.checkRow}
                            onPress={() => toggleFiltro(Number(filtro.id))}
                        >
                            <Text style={[styles.checkMark, checked && styles.checkMarkOn]}>{checked ? '☑' : '☐'}</Text>
                            <Text style={styles.checkLabel}>{filtro.nome ?? `#${filtro.id}`}</Text>
                        </Pressable>
                    );
                })
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {isEditing ? 'Editar Relatório de Dashboard' : 'Novo Relatório de Dashboard'}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Tabs
                    tabs={[
                        {key: 'definicao', label: 'Definição', content: tabDefinicao},
                        {key: 'permissao', label: 'Permissão', content: permissaoSub},
                        {key: 'filtros', label: 'Filtros', content: tabFiltros},
                    ]}
                    initial="definicao"
                />
            </ScrollView>

            <View style={styles.footer}>
                <Pressable style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()} disabled={saving}>
                    <Text style={styles.cancelButtonText}>Voltar</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.saveButton]} onPress={() => void handleSubmit()} disabled={saving}>
                    <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    centerText: {
        color: '#64748b',
        fontSize: 14,
        marginTop: 8,
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    content: {
        padding: 16,
        paddingBottom: 110,
    },
    field: {
        marginBottom: 4,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
        marginTop: 10,
    },
    help: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#fff',
        color: '#1e293b',
    },
    splitSectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155',
        marginTop: 18,
        marginBottom: 8,
    },
    segmentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    segment: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    segmentActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    segmentTextActive: {
        color: '#fff',
    },
    selectBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    selectText: {
        fontSize: 14,
        color: '#1e293b',
    },
    selectPlaceholder: {
        fontSize: 14,
        color: '#94a3b8',
    },
    selectCaret: {
        fontSize: 11,
        color: '#64748b',
    },
    selectPanel: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 8,
    },
    selectOptions: {
        maxHeight: 200,
        marginTop: 6,
    },
    selectOption: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 6,
    },
    selectOptionActive: {
        backgroundColor: '#2563eb',
    },
    selectOptionText: {
        fontSize: 14,
        color: '#334155',
    },
    selectOptionTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyOption: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 13,
        color: '#94a3b8',
    },
    actionButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    addButton: {
        backgroundColor: '#2563eb',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 10,
        marginBottom: 8,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    itemMove: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 6,
    },
    itemMoveText: {
        color: '#334155',
        fontWeight: '600',
        fontSize: 12,
    },
    itemRemove: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 6,
    },
    itemRemoveText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 12,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 12,
        marginBottom: 8,
    },
    checkMark: {
        fontSize: 18,
        color: '#94a3b8',
        marginRight: 10,
    },
    checkMarkOn: {
        color: '#2563eb',
    },
    checkLabel: {
        fontSize: 13,
        color: '#1e293b',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        padding: 14,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    button: {
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: '#475569',
        fontWeight: '600',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#2563eb',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});