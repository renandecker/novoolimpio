import {useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {Tabs} from '../../../shared/components/Tabs';
import {MasterDetail} from '../../../shared/components/MasterDetail';
import {BooleanField} from '../../../shared/components/BooleanField';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../../shared/components/DataTable';
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
} from '../../../shared/services/masterDetailSources';
import type {ApiItem} from '../../../shared/types/types.ts';
import {useApi, api} from '../../../shared/services/api';
import {API_PATHS} from '../../../shared/services/apiPaths';

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

const MAPA_REGRA_COLUMNS: DataTableColumn[] = [
    {
        key: 'cor',
        label: 'Cor Marcador',
        render: (item: any) => <div style={{width: '20px', height: '20px', backgroundColor: item.cor, border: '1px solid #ccc'}} />,
    },
    {key: 'markerTamanho', label: 'Tamanho'},
    {key: 'tipoValor', label: 'Tipo', render: (item: any) => (item.tipoValor ? 'Medida' : 'Valor')},
    {key: 'medidaNome', label: 'Medida'},
    {key: 'condicao', label: 'Condição'},
    {key: 'meta', label: 'Valor/Meta'},
    {key: 'descricao', label: 'Descrição'},
];

interface MapaEntity {
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
}

interface MapaRegraFormData {
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
}

interface MapaRegraRow extends MapaRegraFormData {
    id?: number;
    _pending?: boolean;
    medidaNome?: string;
    medidaMetaNome?: string;
    medidaMeta2Nome?: string;
}

const RESET_REGRA: MapaRegraFormData = {
    cor: '#337ab7',
    tipoValor: false,
    markerTamanho: 10,
    condicao: 'EQ',
    descricao: '',
};

const requiredMark = <span style={{color: '#C90000', marginLeft: 4}}>*</span>;

const optionLabel = (item: any, fallbackKeys: string[] = ['nomeVisualizacao', 'nome']) => {
    for (const key of fallbackKeys) {
        const value = item?.[key];
        if (typeof value === 'string' && value) return value;
    }
    return `#${String(item?.id ?? '')}`;
};

export default function ViewRelatoriosFormMapaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    const [entity, setEntity] = useState<MapaEntity>({});
    const [regras, setRegras] = useState<MapaRegraRow[]>([]);
    const [regraForm, setRegraForm] = useState<MapaRegraFormData>(RESET_REGRA);
    const [showRegraForm, setShowRegraForm] = useState(false);

    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [permissaoSub, setPermissaoSub] = useState<'usuarios' | 'unidades' | 'perfis'>('usuarios');

    const [filtros, setFiltros] = useState<any[]>([]);
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensaoId, setFiltroDimensaoId] = useState('');

    const [estruturas, setEstruturas] = useState<any[]>([]);
    const [dimensoes, setDimensoes] = useState<any[]>([]);
    const [medidas, setMedidas] = useState<any[]>([]);
    const [georeferencias, setGeoreferencias] = useState<any[]>([]);

    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const {post: saveMapa} = useApi(API_PATHS.relatorios.mapa);
    const {put: updateMapa} = useApi(API_PATHS.relatorios.mapa);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {post: saveRegra} = useApi(API_PATHS.relatorios.mapaRegra);
    const {delete: deleteRegra} = useApi(API_PATHS.relatorios.mapaRegra);

    const upd = (patch: Partial<MapaEntity>) => setEntity((prev) => ({...prev, ...patch}));

    useEffect(() => {
        (async () => {
            try {
                const {data} = await api.get<any[]>(API_PATHS.relatorios.estrutura);
                if (Array.isArray(data)) setEstruturas(data);
            } catch (error) {
                console.error('Erro ao carregar estruturas:', error);
            }
            try {
                const {data} = await api.get<any[]>(API_PATHS.relatorios.dimensao);
                if (Array.isArray(data)) setDimensoes(data);
            } catch (error) {
                console.error('Erro ao carregar dimensões:', error);
            }
            try {
                const {data} = await api.get<any[]>(API_PATHS.relatorios.medida);
                if (Array.isArray(data)) setMedidas(data);
            } catch (error) {
                console.error('Erro ao carregar medidas:', error);
            }
            try {
                const {data} = await api.get<any[]>(API_PATHS.relatorios.georeferencia);
                if (Array.isArray(data)) setGeoreferencias(data);
            } catch (error) {
                console.error('Erro ao carregar georreferências:', error);
            }
        })();
    }, []);

    useEffect(() => {
        if (editingId) {
            (async () => {
                try {
                    const mapa: any = (await api.get(`${API_PATHS.relatorios.mapa}/${editingId}`)).data;
                    setEntity((prev) => ({...prev, ...mapa}));

                    const regraList: any[] = (await api.get(`${API_PATHS.relatorios.mapaRegra}/mapa/${editingId}`)).data ?? [];
                    setRegras(regraList.map((r) => ({
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

                    await loadAcessos(editingId);
                } catch (err) {
                    console.error('Erro ao carregar mapa:', err);
                }
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const loadAcessos = async (id: number) => {
        try {
            const [usuariosIds, unidadesIds, perfisIds] = await Promise.all([
                api.get(`${API_PATHS.relatorios.mapa}/buscar-usuarios`, {params: {id}}).then((r) => r.data).catch(() => []),
                api.get(`${API_PATHS.relatorios.mapa}/buscar-unidades`, {params: {id}}).then((r) => r.data).catch(() => []),
                api.get(`${API_PATHS.relatorios.mapa}/buscar-perfils`, {params: {id}}).then((r) => r.data).catch(() => []),
            ]);
            const resolveItems = async (source: string, ids: any[]): Promise<ApiItem[]> => {
                if (!Array.isArray(ids) || ids.length === 0) return [];
                const {data} = await api.get<ApiItem[]>(source);
                const all = Array.isArray(data) ? data : [];
                const set = new Set(ids.map((x: any) => String(x.id ?? x)));
                return all.filter((item) => set.has(String((item as any).id)));
            };
            const [usu, uni, per] = await Promise.all([
                resolveItems(USUARIO_SOURCE, usuariosIds),
                resolveItems(UNIDADE_SOURCE, unidadesIds),
                resolveItems(PERFIL_SOURCE, perfisIds),
            ]);
            setUsuarios(usu);
            setUnidades(uni);
            setPerfis(per);
        } catch (error) {
            console.error('Erro ao carregar acessos do mapa:', error);
        }
    };

    const regraPayload = (r: MapaRegraFormData, mapaId?: number) => ({
        descricao: r.descricao,
        cor: r.cor,
        markerTamanho: r.markerTamanho,
        condicao: r.condicao,
        ativo: true,
        meta: r.tipoValor ? undefined : r.meta,
        meta2: r.tipoValor ? undefined : r.meta2,
        medidaId: r.medidaId,
        medidaMetaId: r.tipoValor ? r.medidaMetaId : undefined,
        medidaMetaDoisId: r.tipoValor ? r.medidaMeta2Id : undefined,
        mapaId,
    });

    const addRegra = async () => {
        const draft = {...regraForm};
        if (!draft.tipoValor && (draft.meta === undefined || draft.meta === null)) {
            alert('Informe o valor da regra');
            return;
        }
        if (draft.tipoValor && !draft.medidaId) {
            alert('Selecione a medida da regra');
            return;
        }
        if (draft.tipoValor && !draft.medidaMetaId) {
            alert('Selecione a medida meta');
            return;
        }
        if (draft.condicao === 'BETWEEN') {
            if (!draft.tipoValor && (draft.meta2 === undefined || draft.meta2 === null)) {
                alert('Informe o segundo valor para a condição Entre');
                return;
            }
            if (draft.tipoValor && !draft.medidaMeta2Id) {
                alert('Selecione a segunda medida para a condição Entre');
                return;
            }
        }
        const med = medidas.find((m) => String(m.id) === String(draft.medidaId));
        const medMeta = medidas.find((m) => String(m.id) === String(draft.medidaMetaId));
        const medMeta2 = medidas.find((m) => String(m.id) === String(draft.medidaMeta2Id));
        try {
            if (editingId) {
                const novaRegra = await saveRegra(regraPayload(draft, editingId));
                const row: MapaRegraRow = {
                    ...draft,
                    id: novaRegra.id,
                    medidaNome: med ? optionLabel(med) : `#${draft.medidaId}`,
                    medidaMetaNome: medMeta ? optionLabel(medMeta) : undefined,
                    medidaMeta2Nome: medMeta2 ? optionLabel(medMeta2) : undefined,
                };
                setRegras((prev) => [...prev, row]);
            } else {
                const row: MapaRegraRow = {
                    ...draft,
                    _pending: true,
                    medidaNome: med ? optionLabel(med) : `#${draft.medidaId}`,
                    medidaMetaNome: medMeta ? optionLabel(medMeta) : undefined,
                    medidaMeta2Nome: medMeta2 ? optionLabel(medMeta2) : undefined,
                };
                setRegras((prev) => [...prev, row]);
            }
            setRegraForm(RESET_REGRA);
            setShowRegraForm(false);
        } catch (err) {
            console.error('Erro ao adicionar regra:', err);
            alert('Erro ao adicionar regra');
        }
    };

    const removeRegra = async (regra: any) => {
        try {
            if (!regra._pending && regra.id) await deleteRegra(regra.id);
            setRegras((prev) => prev.filter((r) => r.id !== regra.id));
        } catch (err) {
            console.error('Erro ao remover regra:', err);
            alert('Erro ao remover regra');
        }
    };

    const addFiltro = async () => {
        if (!filtroNome.trim() || !filtroDimensaoId) {
            alert('Informe nome e dimensão para o filtro');
            return;
        }
        try {
            const novoFiltro = await saveFiltro({
                nome: filtroNome.trim(),
                idEstrutura: entity.estruturaId,
                idDimensao: Number(filtroDimensaoId),
            });
            setFiltros((prev) => [...prev, novoFiltro]);
            setFiltroNome('');
            setFiltroDimensaoId('');
        } catch (err) {
            console.error('Erro ao adicionar filtro:', err);
            alert('Erro ao adicionar filtro');
        }
    };

    const removeFiltro = async (filtro: any) => {
        try {
            await deleteFiltro(filtro.id);
            setFiltros((prev) => prev.filter((f) => f.id !== filtro.id));
        } catch (err) {
            console.error('Erro ao remover filtro:', err);
            alert('Erro ao remover filtro');
        }
    };

    const salvar = async () => {
        setError(undefined);
        if (!entity.nome || entity.nome.trim().length < 3) {
            setError('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        if (!entity.estruturaId) {
            setError('Selecione uma estrutura');
            return;
        }
        if (entity.markerTamanho === undefined || entity.markerTamanho === null || entity.markerTamanho <= 0) {
            setError('Tamanho do marker deve ser maior que zero');
            return;
        }
        if (entity.altura === undefined || entity.altura === null || entity.altura <= 0) {
            setError('Altura deve ser maior que zero');
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

        setSalvando(true);
        try {
            const savedId = editingId
                ? (await updateMapa(editingId, payload), editingId)
                : (await saveMapa(payload)).id;

            for (const regra of regras) {
                if (regra._pending) {
                    await saveRegra(regraPayload(regra, savedId));
                }
            }

            alert('Mapa salvo com sucesso!');
            navigate('/view/relatorios/listMapa');
        } catch (err) {
            console.error('Erro ao salvar mapa:', err);
            setError('Erro ao salvar mapa');
        } finally {
            setSalvando(false);
        }
    };

    const voltar = () => navigate('/view/relatorios/listMapa');

    const dimensoesDisponiveis = entity.estruturaId
        ? dimensoes.filter((d) => d.estruturaId === entity.estruturaId)
        : dimensoes;
    const medidasDisponiveis = entity.estruturaId
        ? medidas.filter((m) => m.estruturaId === entity.estruturaId)
        : medidas;

    const regraActions: DataTableRowAction[] = [
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-minus" />, className: 'btnred', onClick: removeRegra},
    ];

    const filtroActions: DataTableRowAction[] = [
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-trash" />, className: 'btnred', onClick: removeFiltro},
    ];

    const permissaoSubTabs: Array<{key: 'usuarios' | 'unidades' | 'perfis'; label: string; content: ReactNode}> = [
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
    ];

    const tabDefinicao = (
        <div className="form-grid">
            <div className="form-section-title" style={{gridColumn: '1 / -1'}}>Configuração Principal</div>

            <label className="form-field">
                <span className="form-label">Nome {requiredMark}</span>
                <input
                    className="form-input"
                    value={entity.nome ?? ''}
                    onChange={(e) => upd({nome: e.target.value})}
                    placeholder="Nome do mapa"
                />
            </label>
            <label className="form-field">
                <span className="form-label">Estrutura {requiredMark}</span>
                <select
                    className="form-input form-select"
                    value={entity.estruturaId ?? ''}
                    onChange={(e) => upd({estruturaId: e.target.value ? Number(e.target.value) : undefined})}
                >
                    <option value="">-- Selecione --</option>
                    {estruturas.map((es) => (
                        <option key={es.id} value={String(es.id)}>{optionLabel(es, ['nome', 'descricao'])}</option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                <span className="form-label">Dimensão</span>
                <select
                    className="form-input form-select"
                    value={entity.dimensaoId ?? ''}
                    onChange={(e) => upd({dimensaoId: e.target.value ? Number(e.target.value) : undefined})}
                >
                    <option value="">-- Selecione --</option>
                    {dimensoesDisponiveis.map((d) => (
                        <option key={d.id} value={String(d.id)}>{optionLabel(d)}</option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                <span className="form-label">Medida</span>
                <select
                    className="form-input form-select"
                    value={entity.medidaId ?? ''}
                    onChange={(e) => upd({medidaId: e.target.value ? Number(e.target.value) : undefined})}
                >
                    <option value="">-- Selecione --</option>
                    {medidasDisponiveis.map((m) => (
                        <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                <span className="form-label">Georreferência</span>
                <select
                    className="form-input form-select"
                    value={entity.georeferenciaId ?? ''}
                    onChange={(e) => upd({georeferenciaId: e.target.value ? Number(e.target.value) : undefined})}
                >
                    <option value="">-- Selecione --</option>
                    {georeferencias.map((g) => (
                        <option key={g.id} value={String(g.id)}>{optionLabel(g)}</option>
                    ))}
                </select>
            </label>

            <div className="form-section-title" style={{gridColumn: '1 / -1'}}>Visual</div>

            <label className="form-field">
                <span className="form-label">Área/Coordenada</span>
                <input
                    className="form-input"
                    value={entity.coordenada ?? ''}
                    onChange={(e) => upd({coordenada: e.target.value})}
                    placeholder="Coordenadas da área"
                />
            </label>
            <label className="form-field">
                <span className="form-label">Zoom</span>
                <input
                    className="form-input"
                    value={entity.zoom ?? ''}
                    onChange={(e) => upd({zoom: e.target.value})}
                    placeholder="Ex: 8"
                />
                <small style={{color: '#666', display: 'block', fontSize: 11}}>Nível de zoom inicial do mapa</small>
            </label>
            <label className="form-field">
                <span className="form-label">Tamanho Marker {requiredMark}</span>
                <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={entity.markerTamanho ?? ''}
                    onChange={(e) => upd({markerTamanho: e.target.value === '' ? undefined : Number(e.target.value)})}
                />
            </label>
            <label className="form-field">
                <span className="form-label">Altura {requiredMark}</span>
                <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={entity.altura ?? ''}
                    onChange={(e) => upd({altura: e.target.value === '' ? undefined : Number(e.target.value)})}
                />
            </label>
            <label className="form-field">
                <span className="form-label">Utilizando</span>
                <BooleanField value={Boolean(true)} onChange={() => {}} onText="Sim" offText="Não" disabled />
            </label>
        </div>
    );

    const tabPermissao = (
        <div className="form-grid">
            <div style={{gridColumn: '1 / -1', display: 'flex', gap: 8, borderBottom: '1px solid #e0e0e0', marginBottom: 16, paddingBottom: 0}}>
                {permissaoSubTabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setPermissaoSub(t.key)}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e0e0e0',
                            borderBottom: 'none',
                            borderRadius: '6px 6px 0 0',
                            background: permissaoSub === t.key ? '#ffffff' : '#f4f4f4',
                            fontWeight: 700,
                            fontSize: '13px',
                            color: permissaoSub === t.key ? '#2a5a88' : '#555',
                            cursor: 'pointer',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div style={{gridColumn: '1 / -1'}}>
                {permissaoSubTabs.find((t) => t.key === permissaoSub)?.content}
            </div>
        </div>
    );

    const tabRegras = (
        <div>
            {showRegraForm && (
                <div style={{border: '1px solid #a8d0e6', borderRadius: '4px', backgroundColor: '#f8fbff', padding: '16px', marginBottom: '16px'}}>
                    <div className="form-section-title" style={{marginBottom: 12}}>Nova Regra</div>
                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">Cor Marcador</span>
                            <input
                                className="form-input"
                                type="color"
                                value={regraForm.cor}
                                onChange={(e) => setRegraForm({...regraForm, cor: e.target.value})}
                            />
                        </label>
                        <label className="form-field">
                            <span className="form-label">Tipo</span>
                            <select
                                className="form-input form-select"
                                value={regraForm.tipoValor ? 'true' : 'false'}
                                onChange={(e) => setRegraForm({...regraForm, tipoValor: e.target.value === 'true'})}
                            >
                                <option value="false">Valor</option>
                                <option value="true">Medida</option>
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Tamanho Marker</span>
                            <input
                                className="form-input"
                                type="number"
                                min={1}
                                value={regraForm.markerTamanho}
                                onChange={(e) => setRegraForm({...regraForm, markerTamanho: Number(e.target.value)})}
                            />
                        </label>
                        <label className="form-field">
                            <span className="form-label">Condição</span>
                            <select
                                className="form-input form-select"
                                value={regraForm.condicao}
                                onChange={(e) => setRegraForm({...regraForm, condicao: e.target.value})}
                            >
                                {CONDICOES.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </label>
                        {regraForm.tipoValor && (
                            <label className="form-field">
                                <span className="form-label">Medida da Regra</span>
                                <select
                                    className="form-input form-select"
                                    value={regraForm.medidaId ?? ''}
                                    onChange={(e) => setRegraForm({...regraForm, medidaId: e.target.value ? Number(e.target.value) : undefined})}
                                >
                                    <option value="">-- Selecione --</option>
                                    {medidasDisponiveis.map((m) => (
                                        <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                                    ))}
                                </select>
                            </label>
                        )}
                        {regraForm.tipoValor && (
                            <label className="form-field">
                                <span className="form-label">{regraForm.condicao === 'BETWEEN' ? 'Medida Meta Inicial' : 'Medida Meta'}</span>
                                <select
                                    className="form-input form-select"
                                    value={regraForm.medidaMetaId ?? ''}
                                    onChange={(e) => setRegraForm({...regraForm, medidaMetaId: e.target.value ? Number(e.target.value) : undefined})}
                                >
                                    <option value="">-- Selecione --</option>
                                    {medidasDisponiveis.map((m) => (
                                        <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                                    ))}
                                </select>
                            </label>
                        )}
                        {regraForm.tipoValor && regraForm.condicao === 'BETWEEN' && (
                            <label className="form-field">
                                <span className="form-label">Medida Meta Final</span>
                                <select
                                    className="form-input form-select"
                                    value={regraForm.medidaMeta2Id ?? ''}
                                    onChange={(e) => setRegraForm({...regraForm, medidaMeta2Id: e.target.value ? Number(e.target.value) : undefined})}
                                >
                                    <option value="">-- Selecione --</option>
                                    {medidasDisponiveis.map((m) => (
                                        <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                                    ))}
                                </select>
                            </label>
                        )}
                        {!regraForm.tipoValor && (
                            <label className="form-field">
                                <span className="form-label">{regraForm.condicao === 'BETWEEN' ? 'Valor Inicial' : 'Valor'}</span>
                                <input
                                    className="form-input"
                                    type="number"
                                    step="0.01"
                                    value={regraForm.meta ?? ''}
                                    onChange={(e) => setRegraForm({...regraForm, meta: e.target.value === '' ? undefined : Number(e.target.value)})}
                                />
                            </label>
                        )}
                        {!regraForm.tipoValor && regraForm.condicao === 'BETWEEN' && (
                            <label className="form-field">
                                <span className="form-label">Valor Final</span>
                                <input
                                    className="form-input"
                                    type="number"
                                    step="0.01"
                                    value={regraForm.meta2 ?? ''}
                                    onChange={(e) => setRegraForm({...regraForm, meta2: e.target.value === '' ? undefined : Number(e.target.value)})}
                                />
                            </label>
                        )}
                        <label className="form-field" style={{gridColumn: '1 / -1'}}>
                            <span className="form-label">Descrição</span>
                            <input
                                className="form-input"
                                value={regraForm.descricao}
                                onChange={(e) => setRegraForm({...regraForm, descricao: e.target.value})}
                                placeholder="Ex: Acima da meta"
                            />
                        </label>
                        <div className="form-field" style={{gridColumn: '1 / -1', display: 'flex', gap: 8}}>
                            <button type="button" className="btnblue" onClick={() => void addRegra()}>Adicionar Regra</button>
                            <button type="button" className="btnyellow" onClick={() => {setShowRegraForm(false); setRegraForm(RESET_REGRA);}}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            {!showRegraForm && (
                <div style={{marginBottom: 16}}>
                    <button type="button" className="btnblue" onClick={() => setShowRegraForm(true)}>＋ Nova Regra</button>
                </div>
            )}
            <DataTable
                data={regras as unknown as ApiItem[]}
                columns={MAPA_REGRA_COLUMNS}
                extraRowActions={regraActions}
                hideCreate
                hideUpdate
                hideDelete
                hideView
            />
        </div>
    );

    const tabFiltros = (
        <div>
            <div style={{border: '1px solid #a8d0e6', borderRadius: '4px', backgroundColor: '#f8fbff', padding: '16px', marginBottom: '16px'}}>
                <div className="form-section-title" style={{marginBottom: 12}}>Criar Novo Filtro</div>
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Nome {requiredMark}</span>
                        <input
                            className="form-input"
                            value={filtroNome}
                            onChange={(e) => setFiltroNome(e.target.value)}
                            placeholder="Nome do filtro"
                        />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Dimensão {requiredMark}</span>
                        <select
                            className="form-input form-select"
                            value={filtroDimensaoId}
                            onChange={(e) => setFiltroDimensaoId(e.target.value)}
                        >
                            <option value="">-- Selecione --</option>
                            {dimensoesDisponiveis.map((d) => (
                                <option key={d.id} value={String(d.id)}>{optionLabel(d)}</option>
                            ))}
                        </select>
                    </label>
                    <div className="form-field" style={{gridColumn: '1 / -1'}}>
                        <button
                            type="button"
                            className="btnblue"
                            onClick={() => void addFiltro()}
                            disabled={!filtroNome.trim() || !filtroDimensaoId}
                        >
                            ＋ Adicionar Filtro
                        </button>
                    </div>
                </div>
            </div>
            <DataTable
                data={filtros}
                columns={[
                    {key: 'id', label: 'ID'},
                    {key: 'nome', label: 'Nome'},
                    {key: 'estruturaNome', label: 'Estrutura'},
                    {key: 'dimensaoNome', label: 'Dimensão'},
                ]}
                extraRowActions={filtroActions}
                hideCreate
                hideUpdate
                hideDelete
                hideView
            />
        </div>
    );

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group">
                                <span className="breadcrumb-item breadcrumb-current">
                                    Mapa / Relatório Geográfico — {editingId ? 'Edição' : 'Cadastro'}
                                </span>
                            </div>
                        </nav>
                    </div>
                </div>

                {error && <div className="form-erro" style={{maxWidth: 1100, margin: '12px auto 0', background: '#fff0f0', border: '1px solid #f5c6cb', color: '#a61b29', padding: '10px 14px', borderRadius: 6}}>{error}</div>}

                <div style={{maxWidth: 1100, margin: '0 auto', padding: '0 16px 24px'}}>
                    <div className="div_form" style={{padding: 16}}>
                        <Tabs
                            tabs={[
                                {key: 'definicao', label: 'Definição', content: tabDefinicao},
                                {key: 'permissao', label: 'Permissão', content: tabPermissao},
                                {key: 'regras', label: 'Regras', content: tabRegras},
                                {key: 'filtros', label: 'Filtros', content: tabFiltros},
                            ]}
                            initial="definicao"
                        />
                    </div>

                    <div className="form-buttons" style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16}}>
                        <button type="button" className="btnyellow" onClick={voltar} disabled={salvando}>Voltar</button>
                        <button type="button" className="btnstop" onClick={() => void salvar()} disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}