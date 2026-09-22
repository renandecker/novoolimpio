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

const CONDICOES = [
    {value: 'EQ', label: 'Igual'},
    {value: 'NE', label: 'Diferente'},
    {value: 'GT', label: 'Maior que'},
    {value: 'LT', label: 'Menor que'},
    {value: 'GTE', label: 'Maior ou igual'},
    {value: 'LTE', label: 'Menor ou igual'},
    {value: 'BETWEEN', label: 'Entre'},
    {value: 'IN', label: 'Na lista'},
    {value: 'NOT_IN', label: 'Não na lista'},
];

const RESET_REGRA = {
    cor: '#337ab7',
    tipoValor: false,
    markerTamanho: 10,
    condicao: 'EQ',
    descricao: '',
};

interface MapaRegraRow {
    id?: number;
    _pending?: boolean;
    cor: string;
    tipoValor: boolean;
    markerTamanho: number;
    medidaId?: number;
    condicao: string;
    meta?: number;
    medidaMetaId?: number;
    meta2?: number;
    medidaMeta2Id?: number;
    descricao: string;
    medidaNome?: string;
    medidaMetaNome?: string;
    medidaMeta2Nome?: string;
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

export default function ViewRelatoriosFormMapaListScreen({
    route,
    navigation,
}: {
    route: {params?: {id?: number | string}};
    navigation: any;
}) {
    const idParam = route.params?.id != null ? Number(route.params.id) : null;
    const isEditing = idParam != null;

    const [entity, setEntity] = useState<{
        id?: number;
        nome?: string;
        estruturaId?: number;
        dimensaoId?: number;
        medidaId?: number;
        georeferenciaId?: number;
        coordenada?: string;
        zoom?: string;
        markerTamanho?: number;
        altura?: number;
    }>({});
    const [regras, setRegras] = useState<MapaRegraRow[]>([]);
    const [regraForm, setRegraForm] = useState(RESET_REGRA);
    const [showRegraForm, setShowRegraForm] = useState(false);

    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);

    const [filtros, setFiltros] = useState<any[]>([]);
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensaoId, setFiltroDimensaoId] = useState<number | undefined>();

    const [estruturas, setEstruturas] = useState<any[]>([]);
    const [dimensoes, setDimensoes] = useState<any[]>([]);
    const [medidas, setMedidas] = useState<any[]>([]);
    const [georeferencias, setGeoreferencias] = useState<any[]>([]);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    const upd = (patch: Partial<typeof entity>) => setEntity((prev) => ({...prev, ...patch}));

    useEffect(() => {
        (async () => {
            try {
                const resp = await api.get<any[]>(`/api/relatorios/estrutura`);
                if (Array.isArray(resp.data)) setEstruturas(resp.data);
            } catch (err) {
                console.error('Erro ao carregar estruturas:', err);
            }
            try {
                const resp = await api.get<any[]>(`/api/relatorios/dimensao`);
                if (Array.isArray(resp.data)) setDimensoes(resp.data);
            } catch (err) {
                console.error('Erro ao carregar dimensões:', err);
            }
            try {
                const resp = await api.get<any[]>(`/api/relatorios/medida`);
                if (Array.isArray(resp.data)) setMedidas(resp.data);
            } catch (err) {
                console.error('Erro ao carregar medidas:', err);
            }
            try {
                const resp = await api.get<any[]>(`/api/relatorios/georeferencia`);
                if (Array.isArray(resp.data)) setGeoreferencias(resp.data);
            } catch (err) {
                console.error('Erro ao carregar georreferências:', err);
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

    const loadAcessos = async (id: number) => {
        try {
            const [usuariosIds, unidadesIds, perfisIds] = await Promise.all([
                api.get(`/api/relatorios/mapa/buscar-usuarios`, {params: {id}}).then((r) => r.data).catch(() => []),
                api.get(`/api/relatorios/mapa/buscar-unidades`, {params: {id}}).then((r) => r.data).catch(() => []),
                api.get(`/api/relatorios/mapa/buscar-perfils`, {params: {id}}).then((r) => r.data).catch(() => []),
            ]);
            const [usu, uni, per] = await Promise.all([
                resolveItems(USUARIO_SOURCE, usuariosIds),
                resolveItems(UNIDADE_SOURCE, unidadesIds),
                resolveItems(PERFIL_SOURCE, perfisIds),
            ]);
            setUsuarios(usu);
            setUnidades(uni);
            setPerfis(per);
        } catch (err) {
            console.error('Erro ao carregar acessos do mapa:', err);
        }
    };

    useEffect(() => {
        if (!isEditing || idParam == null) return;
        setLoading(true);
        (async () => {
            try {
                const mapaResp = await api.get<any>(`/api/relatorios/mapa/${idParam}`);
                const mapa = mapaResp.data;
                setEntity((prev) => ({...prev, ...mapa}));

                const regrasResp = await api.get<any[]>(`/api/relatorios/mapa-regra/mapa/${idParam}`);
                const lista = Array.isArray(regrasResp.data) ? regrasResp.data : [];
                setRegras(lista.map((r) => ({
                    id: r.id,
                    cor: r.cor ?? '#337ab7',
                    tipoValor: !!r.medidaMetaId,
                    markerTamanho: r.markerTamanho ?? 10,
                    medidaId: r.medidaId,
                    condicao: r.condicao ?? 'EQ',
                    meta: r.meta,
                    medidaMetaId: r.medidaMetaId,
                    meta2: r.meta2,
                    medidaMeta2Id: r.medidaMetaDoisId,
                    descricao: r.descricao ?? '',
                })));

                await loadAcessos(idParam);
            } catch (err) {
                console.error('Erro ao carregar mapa:', err);
                Alert.alert('Erro', 'Não foi possível carregar o mapa.');
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idParam, isEditing]);

    const regraPayload = (r: any, mapaId?: number) => ({
        descricao: r.descricao,
        cor: r.cor,
        markerTamanho: r.markerTamanho,
        condicao: r.condicao,
        ativo: true,
        meta: r.tipoValor ? undefined : r.meta,
        meta2: r.tipoValor ? undefined : r.meta2,
        medidaId: r.tipoValor ? r.medidaId : undefined,
        medidaMetaId: r.tipoValor ? r.medidaMetaId : undefined,
        medidaMetaDoisId: r.tipoValor ? r.medidaMeta2Id : undefined,
        mapaId,
    });

    const addRegra = async () => {
        const draft = {...regraForm};
        if (!draft.tipoValor && (draft.meta === undefined || draft.meta === null)) {
            Alert.alert('Atenção', 'Informe o valor da regra.');
            return;
        }
        if (draft.tipoValor && !draft.medidaId) {
            Alert.alert('Atenção', 'Selecione a medida da regra.');
            return;
        }
        if (draft.tipoValor && !draft.medidaMetaId) {
            Alert.alert('Atenção', 'Selecione a medida meta.');
            return;
        }
        if (draft.condicao === 'BETWEEN') {
            if (!draft.tipoValor && (draft.meta2 === undefined || draft.meta2 === null)) {
                Alert.alert('Atenção', 'Informe o segundo valor para a condição Entre.');
                return;
            }
            if (draft.tipoValor && !draft.medidaMeta2Id) {
                Alert.alert('Atenção', 'Selecione a segunda medida para a condição Entre.');
                return;
            }
        }
        const med = medidas.find((m) => String(m.id) === String(draft.medidaId));
        const medMeta = medidas.find((m) => String(m.id) === String(draft.medidaMetaId));
        const medMeta2 = medidas.find((m) => String(m.id) === String(draft.medidaMeta2Id));
        try {
            if (idParam != null) {
                const resp = await api.post<any>(`/api/relatorios/mapa-regra`, regraPayload(draft, idParam));
                setRegras((prev) => [...prev, {
                    ...draft,
                    id: resp.data.id,
                    medidaNome: med ? optionLabel(med) : `#${draft.medidaId ?? ''}`,
                    medidaMetaNome: medMeta ? optionLabel(medMeta) : undefined,
                    medidaMeta2Nome: medMeta2 ? optionLabel(medMeta2) : undefined,
                }]);
            } else {
                setRegras((prev) => [...prev, {
                    ...draft,
                    _pending: true,
                    medidaNome: med ? optionLabel(med) : `#${draft.medidaId ?? ''}`,
                    medidaMetaNome: medMeta ? optionLabel(medMeta) : undefined,
                    medidaMeta2Nome: medMeta2 ? optionLabel(medMeta2) : undefined,
                }]);
            }
            setRegraForm(RESET_REGRA);
            setShowRegraForm(false);
        } catch (err) {
            console.error('Erro ao adicionar regra:', err);
            Alert.alert('Erro', 'Não foi possível adicionar a regra.');
        }
    };

    const removeRegra = async (regra: any) => {
        try {
            if (!regra._pending && regra.id) {
                await api.delete(`/api/relatorios/mapa-regra/${regra.id}`);
            }
            setRegras((prev) => prev.filter((r) => r.id !== regra.id));
        } catch (err) {
            console.error('Erro ao remover regra:', err);
            Alert.alert('Erro', 'Não foi possível remover a regra.');
        }
    };

    const addFiltro = async () => {
        if (!filtroNome.trim() || !filtroDimensaoId) {
            Alert.alert('Atenção', 'Informe nome e dimensão para o filtro.');
            return;
        }
        try {
            const resp = await api.post<any>(`/api/relatorios/filtros`, {
                nome: filtroNome.trim(),
                idEstrutura: entity.estruturaId,
                idDimensao: filtroDimensaoId,
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
        if (entity.markerTamanho === undefined || entity.markerTamanho === null || entity.markerTamanho <= 0) {
            Alert.alert('Atenção', 'Tamanho do marker deve ser maior que zero.');
            return;
        }
        if (entity.altura === undefined || entity.altura === null || entity.altura <= 0) {
            Alert.alert('Atenção', 'Altura deve ser maior que zero.');
            return;
        }

        const payload = {
            nome: entity.nome?.trim(),
            estruturaId: entity.estruturaId,
            dimensaoId: entity.dimensaoId,
            medidaId: entity.medidaId,
            georeferenciaId: entity.georeferenciaId,
            coordenada: entity.coordenada,
            zoom: entity.zoom,
            markerTamanho: entity.markerTamanho,
            altura: entity.altura,
            utilizando: true,
            todosUsuarios: usuarios.length === 0,
            todosUnidades: unidades.length === 0,
            todosPerfis: perfis.length === 0,
        };

        setSaving(true);
        try {
            let savedId: number;
            if (isEditing && idParam != null) {
                await api.put(`/api/relatorios/mapa/${idParam}`, payload);
                savedId = idParam;
            } else {
                const resp = await api.post<any>(`/api/relatorios/mapa`, payload);
                savedId = resp.data.id;
            }

            for (const regra of regras) {
                if (regra._pending) {
                    await api.post(`/api/relatorios/mapa-regra`, regraPayload(regra, savedId));
                }
            }

            Alert.alert('Sucesso', 'Mapa salvo com sucesso!');
            navigation.goBack();
        } catch (err) {
            console.error('Erro ao salvar mapa:', err);
            Alert.alert('Erro', 'Não foi possível salvar o mapa.');
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

    const dimensoesDisponiveis = entity.estruturaId
        ? dimensoes.filter((d) => d.estruturaId === entity.estruturaId)
        : dimensoes;
    const medidasDisponiveis = entity.estruturaId
        ? medidas.filter((m) => m.estruturaId === entity.estruturaId)
        : medidas;

    const tabDefinicao = (
        <View>
            <Text style={styles.splitSectionTitle}>Configuração Principal</Text>
            <Text style={styles.label}>Nome do Relatório *</Text>
            <TextInput
                style={styles.input}
                value={entity.nome ?? ''}
                onChangeText={(v) => upd({nome: v})}
                placeholder="Ex: Vendas por Região"
            />
            <SelectField
                label="Estrutura *"
                options={estruturas}
                value={entity.estruturaId}
                onChange={(id) => upd({estruturaId: id})}
            />
            <SelectField
                label="Dimensão"
                options={dimensoesDisponiveis}
                value={entity.dimensaoId}
                onChange={(id) => upd({dimensaoId: id})}
            />
            <SelectField
                label="Medida"
                options={medidasDisponiveis}
                value={entity.medidaId}
                onChange={(id) => upd({medidaId: id})}
            />
            <SelectField
                label="Georreferência"
                options={georeferencias}
                value={entity.georeferenciaId}
                onChange={(id) => upd({georeferenciaId: id})}
            />

            <Text style={styles.splitSectionTitle}>Visual</Text>
            <View style={styles.field}>
                <Text style={styles.label}>Área/Coordenada</Text>
                <TextInput
                    style={styles.input}
                    value={entity.coordenada ?? ''}
                    onChangeText={(v) => upd({coordenada: v})}
                    placeholder="Coordenadas da área"
                />
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Zoom</Text>
                <TextInput
                    style={styles.input}
                    value={entity.zoom ?? ''}
                    onChangeText={(v) => upd({zoom: v})}
                    placeholder="Ex: 8"
                />
                <Text style={styles.help}>Nível de zoom inicial do mapa</Text>
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Tamanho Marker *</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(entity.markerTamanho ?? '')}
                    onChangeText={(v) => upd({markerTamanho: v === '' ? undefined : Number(v)})}
                />
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Altura *</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(entity.altura ?? '')}
                    onChangeText={(v) => upd({altura: v === '' ? undefined : Number(v)})}
                />
            </View>
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

    const tabRegras = (
        <View>
            {showRegraForm && (
                <View style={styles.card}>
                    <Text style={styles.splitSectionTitle}>Nova Regra</Text>
                    <View style={styles.field}>
                        <Text style={styles.label}>Cor Marcador</Text>
                        <TextInput
                            style={styles.input}
                            value={regraForm.cor}
                            onChangeText={(v) => setRegraForm({...regraForm, cor: v})}
                            placeholder="#337ab7"
                            autoCapitalize="characters"
                        />
                    </View>
                    <Text style={styles.label}>Tipo</Text>
                    <SegmentRow
                        options={[
                            {value: 'valor', label: 'Valor'},
                            {value: 'medida', label: 'Medida'},
                        ]}
                        value={regraForm.tipoValor ? 'medida' : 'valor'}
                        onChange={(v) => setRegraForm({...regraForm, tipoValor: v === 'medida'})}
                    />
                    <View style={styles.field}>
                        <Text style={styles.label}>Tamanho Marker *</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={String(regraForm.markerTamanho ?? '')}
                            onChangeText={(v) => setRegraForm({...regraForm, markerTamanho: v === '' ? 0 : Number(v)})}
                        />
                    </View>
                    {regraForm.tipoValor && (
                        <SelectField
                            label="Medida da Regra"
                            options={medidasDisponiveis}
                            value={regraForm.medidaId}
                            onChange={(id) => setRegraForm({...regraForm, medidaId: id})}
                        />
                    )}
                    <Text style={styles.label}>Condição</Text>
                    <SegmentRow
                        options={CONDICOES}
                        value={regraForm.condicao}
                        onChange={(v) => setRegraForm({...regraForm, condicao: v})}
                    />
                    {regraForm.tipoValor && (
                        <SelectField
                            label={regraForm.condicao === 'BETWEEN' ? 'Medida Meta Inicial' : 'Medida Meta'}
                            options={medidasDisponiveis}
                            value={regraForm.medidaMetaId}
                            onChange={(id) => setRegraForm({...regraForm, medidaMetaId: id})}
                        />
                    )}
                    {regraForm.tipoValor && regraForm.condicao === 'BETWEEN' && (
                        <SelectField
                            label="Medida Meta Final"
                            options={medidasDisponiveis}
                            value={regraForm.medidaMeta2Id}
                            onChange={(id) => setRegraForm({...regraForm, medidaMeta2Id: id})}
                        />
                    )}
                    {!regraForm.tipoValor && (
                        <View style={styles.field}>
                            <Text style={styles.label}>{regraForm.condicao === 'BETWEEN' ? 'Valor Inicial' : 'Valor'}</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={regraForm.meta === undefined || regraForm.meta === null ? '' : String(regraForm.meta)}
                                onChangeText={(v) => setRegraForm({...regraForm, meta: v === '' ? undefined : Number(v)})}
                            />
                        </View>
                    )}
                    {!regraForm.tipoValor && regraForm.condicao === 'BETWEEN' && (
                        <View style={styles.field}>
                            <Text style={styles.label}>Valor Final</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={regraForm.meta2 === undefined || regraForm.meta2 === null ? '' : String(regraForm.meta2)}
                                onChangeText={(v) => setRegraForm({...regraForm, meta2: v === '' ? undefined : Number(v)})}
                            />
                        </View>
                    )}
                    <View style={styles.field}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={styles.input}
                            value={regraForm.descricao}
                            onChangeText={(v) => setRegraForm({...regraForm, descricao: v})}
                            placeholder="Ex: Acima da meta"
                        />
                    </View>
                    <View style={styles.regraButtons}>
                        <Pressable style={[styles.actionButton, styles.addButton]} onPress={() => void addRegra()}>
                            <Text style={styles.addButtonText}>Adicionar Regra</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => {
                                setShowRegraForm(false);
                                setRegraForm(RESET_REGRA);
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            )}
            {!showRegraForm && (
                <Pressable style={[styles.actionButton, styles.addButton]} onPress={() => setShowRegraForm(true)}>
                    <Text style={styles.addButtonText}>＋ Nova Regra</Text>
                </Pressable>
            )}

            <Text style={styles.splitSectionTitle}>Regras Cadastradas</Text>
            {regras.length === 0 && (
                <Text style={styles.help}>Nenhuma regra cadastrada.</Text>
            )}
            {regras.map((regra, index) => (
                <View key={String(regra.id ?? index)} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                        <View style={[styles.colorDot, {backgroundColor: regra.cor || '#337ab7'}]} />
                        <Text style={styles.itemTitle}>{regra.descricao || `Regra #${String(regra.id ?? index + 1)}`}</Text>
                        <Text style={styles.itemSubtitle}>
                            {regra.tipoValor ? 'Medida' : 'Valor'} · {regra.condicao} · {regra.meta ?? ''}
                        </Text>
                    </View>
                    <Pressable style={styles.itemRemove} onPress={() => void removeRegra(regra)}>
                        <Text style={styles.itemRemoveText}>Remover</Text>
                    </Pressable>
                </View>
            ))}
        </View>
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
                    <Text style={styles.addButtonText}>＋ Adicionar Filtro</Text>
                </Pressable>
            </View>

            <Text style={styles.splitSectionTitle}>Filtros Cadastrados</Text>
            {filtros.map((filtro) => (
                <View key={String(filtro.id)} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>{filtro.nome ?? `Filtro #${filtro.id}`}</Text>
                        <Text style={styles.itemSubtitle}>{filtro.estruturaNome ?? ''} · {filtro.dimensaoNome ?? ''}</Text>
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
                    {isEditing ? 'Editar Mapa / Relatório Geográfico' : 'Novo Mapa / Relatório Geográfico'}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Tabs
                    tabs={[
                        {key: 'definicao', label: 'Definição', content: tabDefinicao},
                        {key: 'permissao', label: 'Permissão', content: permissaoSub},
                        {key: 'regras', label: 'Regras', content: tabRegras},
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
    cancelButton: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    regraButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
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
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#337ab7',
        marginBottom: 4,
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