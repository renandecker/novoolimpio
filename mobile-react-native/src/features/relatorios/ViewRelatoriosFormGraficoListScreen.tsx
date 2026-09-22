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
import {MasterDetail} from '../MasterDetail';
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

const TIPO_GRAFICO_OPTIONS = [
    {value: 'BARRA_VERTICAL', label: 'Barra Vertical'},
    {value: 'BARRA_HORIZONTAL', label: 'Barra Horizontal'},
    {value: 'LINHAS', label: 'Linhas'},
    {value: 'PIZZA', label: 'Pizza'},
    {value: 'CIRCULAR', label: 'Circular'},
    {value: 'COMBINADO', label: 'Combinado'},
];

const TIPO_ORDEM_OPTIONS = [
    {value: 'CRESCENTE', label: 'Crescente'},
    {value: 'DECRESCENTE', label: 'Decrescente'},
    {value: 'NENHUMA', label: 'Nenhuma'},
];

const POSICAO_LEGENDA_OPTIONS = [
    {value: 'w', label: 'Esquerda'},
    {value: 'e', label: 'Direita'},
    {value: 'ne', label: 'Superior Direito'},
    {value: 'se', label: 'Inferior Direito'},
];

const FORMATO_DATA_OPTIONS = [
    {value: 'DATA', label: 'Data'},
    {value: 'DIARIO', label: 'Diário'},
    {value: 'SEMANAL', label: 'Semanal'},
    {value: 'MENSAL', label: 'Mensal'},
    {value: 'TRIMESTRAL', label: 'Trimestral'},
    {value: 'SEMESTRAL', label: 'Semestral'},
    {value: 'ANUAL', label: 'Anual'},
    {value: 'DIARIO/ANUAL', label: 'Diário / Anual'},
    {value: 'SEMANAL/ANUAL', label: 'Semanal / Anual'},
    {value: 'MENSAL/ANUAL', label: 'Mensal / Anual'},
    {value: 'TRIMESTRAL/ANUAL', label: 'Trimestral / Anual'},
    {value: 'SEMESTRAL/ANUAL', label: 'Semestral / Anual'},
];

interface GraficoEntity {
    id?: number;
    nome?: string;
    estruturaId?: number;
    tipo?: string;
    ordemGrafico?: string;
    limite?: number;
    tipoEixo?: number;
    dimensaoReferenciaId?: number;
    medidaInformacaoId?: number;
    dimensaoCombinadoId?: number;
    medidaCombinadoId?: number;
    exibirValor?: boolean;
    exibirLegenda?: boolean;
    exibirPercentual?: boolean;
    valorAcumulado?: boolean;
    posicao?: string;
    colunaLegenda?: number;
    coluna?: number;
    altura?: number;
    diametro?: number;
    margem?: number;
    formatoData?: string;
}

const DEFAULT_ENTITY: GraficoEntity = {
    tipo: 'BARRA_VERTICAL',
    ordemGrafico: 'NENHUMA',
    limite: 10,
    tipoEixo: 0,
    exibirValor: true,
    exibirLegenda: true,
    exibirPercentual: false,
    valorAcumulado: false,
    posicao: 'e',
    colunaLegenda: 1,
    coluna: 1,
    altura: 400,
};

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

function BooleanRow({label, value, onChange}: {label: string; value?: boolean; onChange: (v: boolean) => void}) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <SegmentRow
                options={[
                    {value: 'sim', label: 'Sim'},
                    {value: 'nao', label: 'Não'},
                ]}
                value={value === false ? 'nao' : 'sim'}
                onChange={(v) => onChange(v === 'sim')}
            />
        </View>
    );
}

export default function ViewRelatoriosFormGraficoListScreen({
    route,
    navigation,
}: {
    route: {params?: {id?: number | string}};
    navigation: any;
}) {
    const idParam = route.params?.id != null ? Number(route.params.id) : null;
    const isEditing = idParam != null;

    const [entity, setEntity] = useState<GraficoEntity>(DEFAULT_ENTITY);
    const [estruturas, setEstruturas] = useState<any[]>([]);
    const [dimensoes, setDimensoes] = useState<any[]>([]);
    const [medidas, setMedidas] = useState<any[]>([]);
    const [graficoEixos, setGraficoEixos] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);

    const [eixoDimensaoId, setEixoDimensaoId] = useState<number | undefined>();
    const [eixoMedidaId, setEixoMedidaId] = useState<number | undefined>();
    const [eixoTipo, setEixoTipo] = useState('BARRA_VERTICAL');

    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensaoId, setFiltroDimensaoId] = useState<number | undefined>();

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    const upd = (patch: Partial<GraficoEntity>) => setEntity((prev) => ({...prev, ...patch}));

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
        api.get<GraficoEntity>(`/api/relatorios/grafico/${idParam}`)
            .then((resp) => {
                const grafico = resp.data;
                setEntity((prev) => ({
                    ...prev,
                    ...grafico,
                    dimensaoReferenciaId: (grafico as any).dimensaoReferenciaId ?? (grafico as any).dimensaoInformacaoId,
                }));
            })
            .catch((err) => {
                console.error('Erro ao carregar gráfico:', err);
                Alert.alert('Erro', 'Não foi possível carregar o gráfico.');
            })
            .finally(() => setLoading(false));
    }, [idParam, isEditing]);

    const dimensoesDisponiveis = entity.estruturaId
        ? dimensoes.filter((d) => d.estruturaId === entity.estruturaId)
        : dimensoes;
    const medidasDisponiveis = entity.estruturaId
        ? medidas.filter((m) => m.estruturaId === entity.estruturaId)
        : medidas;

    const isTipoEixoSimples = entity.tipoEixo === 0;
    const isCombinado = entity.tipo === 'COMBINADO';
    const isPizzaOuCircular = entity.tipo === 'PIZZA' || entity.tipo === 'CIRCULAR';
    const isBarra = entity.tipo === 'BARRA_HORIZONTAL' || entity.tipo === 'BARRA_VERTICAL';
    const isMultiEixo = entity.tipoEixo === 1 && !isCombinado;

    const handleTipoEixoChange = (tipoEixo: number) => {
        if (tipoEixo === 1) {
            upd({
                tipoEixo,
                dimensaoReferenciaId: undefined,
                medidaInformacaoId: undefined,
                dimensaoCombinadoId: undefined,
                medidaCombinadoId: undefined,
            });
        } else {
            upd({tipoEixo});
        }
    };

    const addEixo = () => {
        const dim = dimensoesDisponiveis.find((d) => d.id === eixoDimensaoId);
        const med = medidasDisponiveis.find((m) => m.id === eixoMedidaId);
        if (!dim || !med) {
            Alert.alert('Atenção', 'Selecione dimensão e medida para o eixo.');
            return;
        }
        const novoEixo = {
            dimensaoId: dim.id,
            dimensaoNome: optionLabel(dim),
            dimensaoTipo: dim.tipo ?? '',
            medidaId: med.id,
            medidaNome: optionLabel(med),
            medidaTipo: med.tipo ?? '',
            tipo: eixoTipo,
        };
        setGraficoEixos((prev) => [...prev, novoEixo]);
        setEixoDimensaoId(undefined);
        setEixoMedidaId(undefined);
    };

    const removeEixo = (eixo: any) => {
        setGraficoEixos((prev) => prev.filter((e) => e !== eixo));
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
        if (isTipoEixoSimples && !entity.dimensaoReferenciaId) {
            Alert.alert('Atenção', 'Selecione a dimensão de referência.');
            return;
        }
        if (isTipoEixoSimples && !entity.medidaInformacaoId) {
            Alert.alert('Atenção', 'Selecione a medida de informação.');
            return;
        }
        if (isCombinado && (!entity.dimensaoCombinadoId || !entity.medidaCombinadoId)) {
            Alert.alert('Atenção', 'Para tipo Combinado, selecione dimensão e medida combinados.');
            return;
        }

        const payload = {
            nome: entity.nome.trim(),
            estruturaId: entity.estruturaId,
            tipo: entity.tipo,
            ordemGrafico: entity.ordemGrafico,
            limite: entity.limite,
            tipoEixo: entity.tipoEixo,
            dimensaoReferenciaId: entity.dimensaoReferenciaId,
            medidaInformacaoId: entity.medidaInformacaoId,
            dimensaoCombinadoId: entity.dimensaoCombinadoId,
            medidaCombinadoId: entity.medidaCombinadoId,
            exibirValor: entity.exibirValor,
            exibirLegenda: entity.exibirLegenda,
            exibirPercentual: entity.exibirPercentual,
            valorAcumulado: entity.valorAcumulado,
            posicao: entity.posicao,
            colunaLegenda: entity.colunaLegenda,
            coluna: entity.coluna,
            altura: entity.altura,
            diametro: entity.diametro,
            margem: entity.margem,
            formatoData: entity.formatoData,
            todosUsuarios: usuarios.length === 0,
            todosUnidades: unidades.length === 0,
            todosPerfis: perfis.length === 0,
            usuarios,
            unidades,
            perfis,
            graficoEixos,
            filtros,
        };

        setSaving(true);
        try {
            if (isEditing && idParam != null) {
                await api.put(`/api/relatorios/grafico/${idParam}`, payload);
                Alert.alert('Sucesso', 'Gráfico atualizado com sucesso!');
            } else {
                await api.post(`/api/relatorios/grafico`, payload);
                Alert.alert('Sucesso', 'Gráfico criado com sucesso!');
            }
            navigation.goBack();
        } catch (err) {
            console.error('Erro ao salvar gráfico:', err);
            Alert.alert('Erro', 'Não foi possível salvar o gráfico.');
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
                placeholder="Ex: Vendas por Mês"
            />
            <SelectField
                label="Estrutura *"
                options={estruturas}
                value={entity.estruturaId}
                onChange={(id) => upd({estruturaId: id})}
            />
            <Text style={styles.label}>Tipo Gráfico *</Text>
            <SegmentRow
                options={TIPO_GRAFICO_OPTIONS}
                value={entity.tipo}
                onChange={(tipo) => upd({tipo})}
            />
            <Text style={styles.label}>Ordenação</Text>
            <SegmentRow
                options={TIPO_ORDEM_OPTIONS}
                value={entity.ordemGrafico}
                onChange={(v) => upd({ordemGrafico: v})}
            />
            <View style={styles.field}>
                <Text style={styles.label}>Limite Gráfico</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(entity.limite ?? '')}
                    onChangeText={(v) => upd({limite: v === '' ? undefined : Number(v)})}
                />
                <Text style={styles.help}>Limite máximo de 50 registros para exibir no gráfico</Text>
            </View>
            <Text style={styles.label}>Tipo Eixo</Text>
            <SegmentRow
                options={[
                    {value: 0, label: 'Simples'},
                    {value: 1, label: 'Multi Eixo'},
                ]}
                value={entity.tipoEixo}
                onChange={(v) => handleTipoEixoChange(v)}
            />

            {isTipoEixoSimples && (
                <>
                    <Text style={styles.splitSectionTitle}>Eixo do Gráfico</Text>
                    <SelectField
                        label="Dimensão Referência *"
                        options={dimensoesDisponiveis}
                        value={entity.dimensaoReferenciaId}
                        onChange={(id) => upd({dimensaoReferenciaId: id})}
                    />
                    <SelectField
                        label="Medida Informação *"
                        options={medidasDisponiveis}
                        value={entity.medidaInformacaoId}
                        onChange={(id) => upd({medidaInformacaoId: id})}
                    />
                </>
            )}

            {isCombinado && (
                <>
                    <Text style={styles.splitSectionTitle}>Eixo Combinado</Text>
                    <SelectField
                        label="Dimensão Combinado"
                        options={dimensoesDisponiveis}
                        value={entity.dimensaoCombinadoId}
                        onChange={(id) => upd({dimensaoCombinadoId: id})}
                    />
                    <SelectField
                        label="Medida Combinado"
                        options={medidasDisponiveis}
                        value={entity.medidaCombinadoId}
                        onChange={(id) => upd({medidaCombinadoId: id})}
                    />
                </>
            )}

            <Text style={styles.splitSectionTitle}>Opções de Exibição</Text>
            <BooleanRow label="Exibir Valor" value={entity.exibirValor} onChange={(v) => upd({exibirValor: v})} />
            <BooleanRow label="Exibir Legenda" value={entity.exibirLegenda} onChange={(v) => upd({exibirLegenda: v})} />
            {isPizzaOuCircular && (
                <BooleanRow label="Exibir Percentual" value={entity.exibirPercentual} onChange={(v) => upd({exibirPercentual: v})} />
            )}
            {isBarra && (
                <BooleanRow label="Acumulado" value={entity.valorAcumulado} onChange={(v) => upd({valorAcumulado: v})} />
            )}

            {entity.exibirLegenda !== false && (
                <>
                    <Text style={styles.label}>Posição Legenda</Text>
                    <SegmentRow
                        options={POSICAO_LEGENDA_OPTIONS}
                        value={entity.posicao}
                        onChange={(v) => upd({posicao: v})}
                    />
                    <View style={styles.field}>
                        <Text style={styles.label}>Coluna Legenda</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={String(entity.colunaLegenda ?? '')}
                            onChangeText={(v) => upd({colunaLegenda: v === '' ? undefined : Number(v)})}
                        />
                    </View>
                </>
            )}

            {isPizzaOuCircular && (
                <View style={styles.field}>
                    <Text style={styles.label}>Coluna Gráfico</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(entity.coluna ?? '')}
                        onChangeText={(v) => upd({coluna: v === '' ? undefined : Number(v)})}
                    />
                </View>
            )}
            <View style={styles.field}>
                <Text style={styles.label}>Altura Gráfico</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(entity.altura ?? '')}
                    onChangeText={(v) => upd({altura: v === '' ? undefined : Number(v)})}
                />
            </View>
            {entity.tipo === 'PIZZA' && (
                <View style={styles.field}>
                    <Text style={styles.label}>Diâmetro</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(entity.diametro ?? '')}
                        onChangeText={(v) => upd({diametro: v === '' ? undefined : Number(v)})}
                    />
                </View>
            )}
            {entity.tipo === 'CIRCULAR' && (
                <View style={styles.field}>
                    <Text style={styles.label}>Margem Separação</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(entity.margem ?? '')}
                        onChangeText={(v) => upd({margem: v === '' ? undefined : Number(v)})}
                    />
                </View>
            )}
            {isTipoEixoSimples && entity.dimensaoReferenciaId && (
                <>
                    <Text style={styles.label}>Formato Data</Text>
                    <SegmentRow
                        options={FORMATO_DATA_OPTIONS}
                        value={entity.formatoData}
                        onChange={(v) => upd({formatoData: v})}
                    />
                </>
            )}

            {isMultiEixo && (
                <View>
                    <Text style={styles.splitSectionTitle}>Eixos do Gráfico</Text>
                    <SelectField
                        label="Dimensão Informação"
                        options={dimensoesDisponiveis}
                        value={eixoDimensaoId}
                        onChange={setEixoDimensaoId}
                    />
                    <SelectField
                        label="Medida Informação"
                        options={medidasDisponiveis}
                        value={eixoMedidaId}
                        onChange={setEixoMedidaId}
                    />
                    <Text style={styles.label}>Tipo do Eixo</Text>
                    <SegmentRow
                        options={TIPO_GRAFICO_OPTIONS}
                        value={eixoTipo}
                        onChange={setEixoTipo}
                    />
                    <Pressable style={[styles.actionButton, styles.addButton]} onPress={addEixo}>
                        <Text style={styles.addButtonText}>+ Adicionar Eixo</Text>
                    </Pressable>
                    {graficoEixos.map((eixo, index) => (
                        <View key={String(index)} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemTitle}>{eixo.dimensaoNome}</Text>
                                <Text style={styles.itemSubtitle}>{eixo.medidaNome} · {eixo.tipo ?? ''}</Text>
                            </View>
                            <Pressable style={styles.itemRemove} onPress={() => removeEixo(eixo)}>
                                <Text style={styles.itemRemoveText}>Remover</Text>
                            </Pressable>
                        </View>
                    ))}
                    {graficoEixos.length === 0 && (
                        <Text style={styles.help}>Nenhum eixo adicionado.</Text>
                    )}
                </View>
            )}
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
                    options={dimensoesDisponiveis}
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
                    {isEditing ? 'Editar Relatório de Gráfico' : 'Novo Relatório de Gráfico'}
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