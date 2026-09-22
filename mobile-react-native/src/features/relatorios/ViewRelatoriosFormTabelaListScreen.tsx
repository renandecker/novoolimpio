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

interface TabelaEntity {
    id?: number;
    nome?: string;
    estruturaId?: number;
    colunas?: any[];
}

const optionLabel = (item: any): string => {
    if (!item) return '';
    const value = item.nomeVisualizacao ?? item.nome ?? item.descricao;
    if (typeof value === 'string' && value.trim()) return value;
    return `#${String(item.id ?? '')}`;
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

export default function ViewRelatoriosFormTabelaListScreen({
    route,
    navigation,
}: {
    route: {params?: {id?: number | string}};
    navigation: any;
}) {
    const idParam = route.params?.id != null ? Number(route.params.id) : null;
    const isEditing = idParam != null;

    const [entity, setEntity] = useState<TabelaEntity>({});
    const [estruturas, setEstruturas] = useState<any[]>([]);
    const [dimensoes, setDimensoes] = useState<any[]>([]);
    const [medidas, setMedidas] = useState<any[]>([]);
    const [dimensoesDescritivas, setDimensoesDescritivas] = useState<any[]>([]);
    const [dimensoesTempo, setDimensoesTempo] = useState<any[]>([]);
    const [medidasSelecionadas, setMedidasSelecionadas] = useState<any[]>([]);
    const [tabelaColunas, setTabelaColunas] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);

    const [dimensaoDescId, setDimensaoDescId] = useState<number | undefined>();
    const [dimensaoTempoId, setDimensaoTempoId] = useState<number | undefined>();
    const [medidaId, setMedidaId] = useState<number | undefined>();
    const [colunaDimensaoId, setColunaDimensaoId] = useState<number | undefined>();
    const [colunaMedidaId, setColunaMedidaId] = useState<number | undefined>();

    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensaoId, setFiltroDimensaoId] = useState<number | undefined>();

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    const upd = (patch: Partial<TabelaEntity>) => setEntity((prev) => ({...prev, ...patch}));

    const handleEstruturaChange = (id?: number) => {
        upd({estruturaId: id ?? undefined});
        setDimensoesDescritivas([]);
        setDimensoesTempo([]);
        setMedidasSelecionadas([]);
        setTabelaColunas([]);
        setDimensaoDescId(undefined);
        setDimensaoTempoId(undefined);
        setMedidaId(undefined);
        setColunaDimensaoId(undefined);
        setColunaMedidaId(undefined);
    };

    useEffect(() => {
        (async () => {
            try {
                const estruturasResp = await api.get<any[]>(`/api/relatorios/estrutura`);
                if (Array.isArray(estruturasResp.data)) setEstruturas(estruturasResp.data);
            } catch (err) {
                console.error('Erro ao carregar estruturas:', err);
            }
            try {
                const dimsResp = await api.get<any[]>(`/api/relatorios/dimensao`);
                if (Array.isArray(dimsResp.data)) setDimensoes(dimsResp.data);
            } catch (err) {
                console.error('Erro ao carregar dimensões:', err);
            }
            try {
                const medsResp = await api.get<any[]>(`/api/relatorios/medida`);
                if (Array.isArray(medsResp.data)) setMedidas(medsResp.data);
            } catch (err) {
                console.error('Erro ao carregar medidas:', err);
            }
        })();
    }, []);

    useEffect(() => {
        if (!isEditing || idParam == null) return;
        setLoading(true);
        api.get<TabelaEntity>(`/api/relatorios/tabela/${idParam}`)
            .then((resp) => {
                const tabela = resp.data;
                setEntity(tabela);
                if (Array.isArray(tabela.colunas)) setTabelaColunas(tabela.colunas);
            })
            .catch((err) => {
                console.error('Erro ao carregar tabela:', err);
                Alert.alert('Erro', 'Não foi possível carregar a tabela.');
            })
            .finally(() => setLoading(false));
    }, [idParam, isEditing]);

    const dimensoesEstrutura = entity.estruturaId
        ? dimensoes.filter((d) => d.estruturaId === entity.estruturaId)
        : dimensoes;
    const dimensoesDescEstrutura = dimensoesEstrutura.filter((d) => d.tipoInfo !== 'TEMPO');
    const dimensoesTempoEstrutura = dimensoesEstrutura.filter((d) => d.tipoInfo === 'TEMPO');
    const medidasEstrutura = entity.estruturaId
        ? medidas.filter((m) => m.estruturaId === entity.estruturaId)
        : medidas;

    const addDimensaoDescritiva = () => {
        const dim = dimensoesDescEstrutura.find((d) => d.id === dimensaoDescId);
        if (!dim) {
            Alert.alert('Atenção', 'Selecione uma dimensão descritiva.');
            return;
        }
        if (dimensoesDescritivas.some((d) => d.id === dim.id)) {
            Alert.alert('Atenção', 'Dimensão descritiva já adicionada.');
            return;
        }
        setDimensoesDescritivas((prev) => [...prev, dim]);
        setDimensaoDescId(undefined);
    };

    const removeDimensaoDescritiva = (item: any) => {
        setDimensoesDescritivas((prev) => prev.filter((d) => d.id !== item.id));
    };

    const addDimensaoTempo = () => {
        const dim = dimensoesTempoEstrutura.find((d) => d.id === dimensaoTempoId);
        if (!dim) {
            Alert.alert('Atenção', 'Selecione uma dimensão de tempo.');
            return;
        }
        if (dimensoesTempo.some((d) => d.id === dim.id)) {
            Alert.alert('Atenção', 'Dimensão de tempo já adicionada.');
            return;
        }
        setDimensoesTempo((prev) => [...prev, dim]);
        setDimensaoTempoId(undefined);
    };

    const removeDimensaoTempo = (item: any) => {
        setDimensoesTempo((prev) => prev.filter((d) => d.id !== item.id));
    };

    const addMedida = () => {
        const med = medidasEstrutura.find((m) => m.id === medidaId);
        if (!med) {
            Alert.alert('Atenção', 'Selecione uma medida.');
            return;
        }
        if (medidasSelecionadas.some((m) => m.id === med.id)) {
            Alert.alert('Atenção', 'Medida já adicionada.');
            return;
        }
        setMedidasSelecionadas((prev) => [...prev, med]);
        setMedidaId(undefined);
    };

    const removeMedidaDaLista = (item: any) => {
        setMedidasSelecionadas((prev) => prev.filter((m) => m.id !== item.id));
    };

    const addColuna = () => {
        const dim = dimensoesDescritivas.find((d) => d.id === colunaDimensaoId);
        const med = medidasSelecionadas.find((m) => m.id === colunaMedidaId);
        if (!dim || !med) {
            Alert.alert('Atenção', 'Selecione a dimensão e a medida da coluna.');
            return;
        }
        const novaColuna = {
            dimensaoId: dim.id,
            dimensaoNome: optionLabel(dim),
            dimensaoTipo: dim.tipo ?? '',
            medidaId: med.id,
            medidaNome: optionLabel(med),
            medidaTipo: med.tipo ?? '',
        };
        setTabelaColunas((prev) => [...prev, novaColuna]);
        setColunaDimensaoId(undefined);
        setColunaMedidaId(undefined);
    };

    const removeColuna = (coluna: any) => {
        setTabelaColunas((prev) => prev.filter((c) => c !== coluna));
    };

    const moveColuna = (coluna: any, dir: -1 | 1) => {
        setTabelaColunas((prev) => {
            const index = prev.indexOf(coluna);
            const target = index + dir;
            if (index < 0 || target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const addFiltro = async () => {
        if (!filtroNome.trim() || !filtroDimensaoId) {
            Alert.alert('Atenção', 'Informe nome e dimensão para o filtro.');
            return;
        }
        try {
            const resp = await api.post<any>(`/api/relatorios/filtros`, {
                nome: filtroNome.trim(),
                idDimensao: filtroDimensaoId,
                idEstrutura: entity.estruturaId,
            });
            setFiltros((prev) => [...prev, resp.data]);
            setFiltroNome('');
            setFiltroDimensaoId(undefined);
        } catch (err) {
            console.error('Erro ao adicionar filtro:', err);
            Alert.alert('Erro', 'Não foi possível adicionar o filtro.');
        }
    };

    const removeFiltro = async (filtro: any) => {
        try {
            await api.delete(`/api/relatorios/filtros/${filtro.id}`);
            setFiltros((prev) => prev.filter((f) => f.id !== filtro.id));
        } catch (err) {
            console.error('Erro ao remover filtro:', err);
            Alert.alert('Erro', 'Não foi possível remover o filtro.');
        }
    };

    const handleSubmit = async () => {
        if (!entity.nome || entity.nome.trim().length < 3) {
            Alert.alert('Atenção', 'Nome deve ter pelo menos 3 caracteres.');
            return;
        }
        if (!entity.estruturaId) {
            Alert.alert('Atenção', 'Selecione uma estrutura.');
            return;
        }

        const payload = {
            nome: entity.nome.trim(),
            estruturaId: entity.estruturaId,
            todosUsuarios: usuarios.length === 0,
            todosUnidades: unidades.length === 0,
            todosPerfis: perfis.length === 0,
            colunas: tabelaColunas
                .filter((c: any) => c && c.dimensaoId)
                .map((c: any, index: number) => ({
                    dimensaoId: c.dimensaoId,
                    medidaId: c.medidaId ?? null,
                    ordem: index + 1,
                })),
        };

        setSaving(true);
        try {
            if (isEditing && idParam != null) {
                await api.put(`/api/relatorios/tabela/${idParam}`, payload);
                Alert.alert('Sucesso', 'Tabela atualizada com sucesso!');
            } else {
                await api.post(`/api/relatorios/tabela`, payload);
                Alert.alert('Sucesso', 'Tabela criada com sucesso!');
            }
            navigation.goBack();
        } catch (err) {
            console.error('Erro ao salvar tabela:', err);
            Alert.alert('Erro', 'Não foi possível salvar a tabela.');
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

    const tabDefinicao = (
        <View>
            <Text style={styles.splitSectionTitle}>Principal</Text>
            <Text style={styles.label}>Nome do Relatório *</Text>
            <TextInput
                style={styles.input}
                value={entity.nome ?? ''}
                onChangeText={(v) => upd({nome: v})}
                placeholder="Ex: Relatório de Vendas"
            />
            <SelectField
                label="Estrutura *"
                options={estruturas}
                value={entity.estruturaId}
                onChange={handleEstruturaChange}
                placeholder="-- Selecione --"
            />

            <Tabs
                tabs={[
                    {
                        key: 'descritiva',
                        label: 'Dimensão Descritiva',
                        content: (
                            <View>
                                {dimensoesDescEstrutura.length > 0 && (
                                    <SelectField
                                        label="Adicionar Dimensão Descritiva"
                                        options={dimensoesDescEstrutura.filter((d) => !dimensoesDescritivas.some((sel) => sel.id === d.id))}
                                        value={dimensaoDescId}
                                        onChange={setDimensaoDescId}
                                    />
                                )}
                                <Pressable
                                    style={[styles.actionButton, styles.addButton, !dimensaoDescId && {opacity: 0.5}]}
                                    disabled={!dimensaoDescId}
                                    onPress={addDimensaoDescritiva}
                                >
                                    <Text style={styles.addButtonText}>+ Adicionar</Text>
                                </Pressable>
                                {dimensoesDescritivas.map((item) => (
                                    <View key={String(item.id)} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle}>{optionLabel(item)}</Text>
                                        </View>
                                        <Pressable style={styles.itemRemove} onPress={() => removeDimensaoDescritiva(item)}>
                                            <Text style={styles.itemRemoveText}>Remover</Text>
                                        </Pressable>
                                    </View>
                                ))}
                                {dimensoesDescritivas.length === 0 && (
                                    <Text style={styles.help}>Nenhuma dimensão descritiva adicionada.</Text>
                                )}
                            </View>
                        ),
                    },
                    {
                        key: 'tempo',
                        label: 'Dimensão Tempo',
                        content: (
                            <View>
                                {dimensoesTempoEstrutura.length > 0 && (
                                    <SelectField
                                        label="Adicionar Dimensão Tempo"
                                        options={dimensoesTempoEstrutura.filter((d) => !dimensoesTempo.some((sel) => sel.id === d.id))}
                                        value={dimensaoTempoId}
                                        onChange={setDimensaoTempoId}
                                    />
                                )}
                                <Pressable
                                    style={[styles.actionButton, styles.addButton, !dimensaoTempoId && {opacity: 0.5}]}
                                    disabled={!dimensaoTempoId}
                                    onPress={addDimensaoTempo}
                                >
                                    <Text style={styles.addButtonText}>+ Adicionar</Text>
                                </Pressable>
                                {dimensoesTempo.map((item) => (
                                    <View key={String(item.id)} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle}>{optionLabel(item)}</Text>
                                        </View>
                                        <Pressable style={styles.itemRemove} onPress={() => removeDimensaoTempo(item)}>
                                            <Text style={styles.itemRemoveText}>Remover</Text>
                                        </Pressable>
                                    </View>
                                ))}
                                {dimensoesTempo.length === 0 && (
                                    <Text style={styles.help}>Nenhuma dimensão de tempo adicionada.</Text>
                                )}
                            </View>
                        ),
                    },
                    {
                        key: 'medidas',
                        label: 'Medidas',
                        content: (
                            <View>
                                {medidasEstrutura.length > 0 && (
                                    <SelectField
                                        label="Adicionar Medida"
                                        options={medidasEstrutura.filter((m) => !medidasSelecionadas.some((sel) => sel.id === m.id))}
                                        value={medidaId}
                                        onChange={setMedidaId}
                                    />
                                )}
                                <Pressable
                                    style={[styles.actionButton, styles.addButton, !medidaId && {opacity: 0.5}]}
                                    disabled={!medidaId}
                                    onPress={addMedida}
                                >
                                    <Text style={styles.addButtonText}>+ Adicionar</Text>
                                </Pressable>
                                {medidasSelecionadas.map((item) => (
                                    <View key={String(item.id)} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle}>{optionLabel(item)}</Text>
                                        </View>
                                        <Pressable style={styles.itemRemove} onPress={() => removeMedidaDaLista(item)}>
                                            <Text style={styles.itemRemoveText}>Remover</Text>
                                        </Pressable>
                                    </View>
                                ))}
                                {medidasSelecionadas.length === 0 && (
                                    <Text style={styles.help}>Nenhuma medida adicionada.</Text>
                                )}
                            </View>
                        ),
                    },
                    {
                        key: 'colunas',
                        label: 'Colunas da Tabela',
                        content: (
                            <View>
                                <SelectField
                                    label="Dimensão da Coluna"
                                    options={dimensoesDescritivas}
                                    value={colunaDimensaoId}
                                    onChange={setColunaDimensaoId}
                                />
                                <SelectField
                                    label="Medida da Coluna"
                                    options={medidasSelecionadas}
                                    value={colunaMedidaId}
                                    onChange={setColunaMedidaId}
                                />
                                <Pressable
                                    style={[styles.actionButton, styles.addButton, (!colunaDimensaoId || !colunaMedidaId) && {opacity: 0.5}]}
                                    disabled={!colunaDimensaoId || !colunaMedidaId}
                                    onPress={addColuna}
                                >
                                    <Text style={styles.addButtonText}>+ Adicionar Coluna</Text>
                                </Pressable>
                                {tabelaColunas.map((coluna, index) => (
                                    <View key={String(index)} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle}>{coluna.dimensaoNome}</Text>
                                            <Text style={styles.itemSubtitle}>{coluna.medidaNome}</Text>
                                        </View>
                                        <Pressable style={styles.itemMove} onPress={() => moveColuna(coluna, -1)}>
                                            <Text style={styles.itemMoveText}>▲</Text>
                                        </Pressable>
                                        <Pressable style={styles.itemMove} onPress={() => moveColuna(coluna, 1)}>
                                            <Text style={styles.itemMoveText}>▼</Text>
                                        </Pressable>
                                        <Pressable style={styles.itemRemove} onPress={() => removeColuna(coluna)}>
                                            <Text style={styles.itemRemoveText}>Remover</Text>
                                        </Pressable>
                                    </View>
                                ))}
                                {tabelaColunas.length === 0 && (
                                    <Text style={styles.help}>Nenhuma coluna adicionada.</Text>
                                )}
                            </View>
                        ),
                    },
                ]}
                initial="descritiva"
            />
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
            <View style={styles.card}>
                <Text style={styles.splitSectionTitle}>Criar Novo Filtro</Text>
                <Text style={styles.label}>Nome *</Text>
                <TextInput
                    style={styles.input}
                    value={filtroNome}
                    onChangeText={setFiltroNome}
                    placeholder="Ex: Filtrar por Região"
                />
                <SelectField
                    label="Dimensão *"
                    options={dimensoesEstrutura}
                    value={filtroDimensaoId}
                    onChange={setFiltroDimensaoId}
                />
                <Pressable
                    style={[styles.actionButton, styles.addButton, (!filtroNome.trim() || !filtroDimensaoId) && {opacity: 0.5}]}
                    disabled={!filtroNome.trim() || !filtroDimensaoId}
                    onPress={() => void addFiltro()}
                >
                    <Text style={styles.addButtonText}>+ Adicionar Filtro</Text>
                </Pressable>
            </View>

            <Text style={styles.splitSectionTitle}>Filtros Cadastrados</Text>
            {filtros.map((filtro) => (
                <View key={String(filtro.id)} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>{filtro.nome ?? `Filtro #${filtro.id}`}</Text>
                        <Text style={styles.itemSubtitle}>{filtro.dimensaoNome ?? ''}</Text>
                    </View>
                    <Pressable style={styles.itemRemove} onPress={() => void removeFiltro(filtro)}>
                        <Text style={styles.itemRemoveText}>Remover</Text>
                    </Pressable>
                </View>
            ))}
            {filtros.length === 0 && (
                <Text style={styles.help}>Nenhum filtro cadastrado.</Text>
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
                    {isEditing ? 'Editar Relatório de Tabela' : 'Novo Relatório de Tabela'}
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
    card: {
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 10,
        padding: 14,
        marginTop: 8,
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
        marginRight: 6,
    },
    itemMoveText: {
        color: '#475569',
        fontWeight: '600',
        fontSize: 12,
    },
    itemRemove: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    itemRemoveText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 12,
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