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

const GRAFICO_EIXO_COLUMNS: DataTableColumn[] = [
    {key: 'dimensaoNome', label: 'Dimensão Informação'},
    {key: 'dimensaoTipo', label: 'Dimensão Tipo'},
    {key: 'medidaNome', label: 'Medida Informação'},
    {key: 'medidaTipo', label: 'Medida Tipo'},
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

const requiredMark = <span style={{color: '#C90000', marginLeft: 4}}>*</span>;

const optionLabel = (item: any, fallbackKeys: string[] = ['nomeVisualizacao', 'nome']) => {
    for (const key of fallbackKeys) {
        const value = item?.[key];
        if (typeof value === 'string' && value) return value;
    }
    return `#${String(item?.id ?? '')}`;
};

export default function ViewRelatoriosFormGraficoListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    const [entity, setEntity] = useState<GraficoEntity>(DEFAULT_ENTITY);
    const [graficoEixos, setGraficoEixos] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);
    const [estruturaSelecionada, setEstruturaSelecionada] = useState<any>(null);

    const [estruturas, setEstruturas] = useState<any[]>([]);
    const [dimensoes, setDimensoes] = useState<any[]>([]);
    const [medidas, setMedidas] = useState<any[]>([]);

    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const [eixoDimensaoId, setEixoDimensaoId] = useState('');
    const [eixoMedidaId, setEixoMedidaId] = useState('');
    const [eixoTipo, setEixoTipo] = useState('BARRA_VERTICAL');

    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensaoId, setFiltroDimensaoId] = useState('');

    const [permissaoSub, setPermissaoSub] = useState<'usuarios' | 'unidades' | 'perfis'>('usuarios');

    const {post: saveGrafico} = useApi(API_PATHS.relatorios.grafico);
    const {put: updateGrafico} = useApi(API_PATHS.relatorios.grafico);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);

    const upd = (patch: Partial<GraficoEntity>) => setEntity((prev) => ({...prev, ...patch}));

    const loadEstruturaPorId = async (id: number) => {
        try {
            const estrutura = (await api.get(`${API_PATHS.relatorios.estrutura}/${id}`)).data;
            setEstruturaSelecionada(estrutura);
        } catch (error) {
            console.error('Erro ao carregar estrutura:', error);
        }
    };

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
        })();
    }, []);

    useEffect(() => {
        if (editingId) {
            loadGraficoPorId(editingId)
                .then(async (grafico: any) => {
                    setEntity((prev) => ({
                        ...prev,
                        ...grafico,
                        dimensaoReferenciaId: grafico.dimensaoReferenciaId ?? grafico.dimensaoInformacaoId,
                        tipoEixo: grafico.tipoEixo ?? 0,
                    }));
                    if (grafico.estruturaId) await loadEstruturaPorId(grafico.estruturaId);
                })
                .catch((error) => console.error('Erro ao carregar gráfico:', error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const loadGraficoPorId = async (id: number) => (await api.get(`${API_PATHS.relatorios.grafico}/${id}`)).data;

    const handleEstruturaChange = (id: number | undefined) => {
        upd({estruturaId: id ?? undefined});
        setEstruturaSelecionada(null);
        if (id) loadEstruturaPorId(id);
    };

    const handleTipoGraficoChange = (tipo: string) => {
        upd({tipo});
    };

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
        const dim = dimensoes.find((d) => String(d.id) === eixoDimensaoId);
        const med = medidas.find((m) => String(m.id) === eixoMedidaId);
        if (!dim || !med) {
            alert('Selecione dimensão e medida para o eixo');
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
        const newEixos = [...graficoEixos, novoEixo];
        setGraficoEixos(newEixos);
        setEixoDimensaoId('');
        setEixoMedidaId('');
    };

    const removeEixo = (eixo: any) => {
        setGraficoEixos((prev) => prev.filter((e) => e !== eixo));
    };

    const addFiltro = async () => {
        if (!filtroNome.trim() || !filtroDimensaoId) {
            alert('Informe nome e dimensão para o filtro');
            return;
        }
        try {
            const newFiltro = await saveFiltro({
                nome: filtroNome.trim(),
                idDimensao: Number(filtroDimensaoId),
                idEstrutura: entity.estruturaId,
            });
            setFiltros((prev) => [...prev, newFiltro]);
            setFiltroNome('');
            setFiltroDimensaoId('');
        } catch (error) {
            console.error('Erro ao adicionar filtro:', error);
            alert('Erro ao adicionar filtro');
        }
    };

    const removeFiltro = async (filtro: any) => {
        try {
            await deleteFiltro(filtro.id);
            setFiltros((prev) => prev.filter((f) => f.id !== filtro.id));
        } catch (error) {
            console.error('Erro ao remover filtro:', error);
            alert('Erro ao remover filtro');
        }
    };

    const isTipoEixoSimples = entity.tipoEixo === 0;
    const isCombinado = entity.tipo === 'COMBINADO';
    const isPizzaOuCircular = entity.tipo === 'PIZZA' || entity.tipo === 'CIRCULAR';
    const isBarra = entity.tipo === 'BARRA_HORIZONTAL' || entity.tipo === 'BARRA_VERTICAL';
    const isMultiEixo = entity.tipoEixo === 1 && !isCombinado;
    const showFormatoData =
        isTipoEixoSimples &&
        ((entity.dimensaoReferenciaId && estruturaSelecionada) ||
            (entity.dimensaoCombinadoId && isCombinado));

    const dimensoesDisponiveis = entity.estruturaId
        ? dimensoes.filter((d) => d.estruturaId === entity.estruturaId)
        : dimensoes;
    const medidasDisponiveis = entity.estruturaId
        ? medidas.filter((m) => m.estruturaId === entity.estruturaId)
        : medidas;

    const salvar = async () => {
        setError(undefined);
        if (!entity.nome || entity.nome.length < 3) {
            setError('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        if (!entity.estruturaId) {
            setError('Selecione uma estrutura');
            return;
        }
        if (isTipoEixoSimples && !entity.dimensaoReferenciaId) {
            setError('Selecione a dimensão de referência');
            return;
        }
        if (isTipoEixoSimples && !entity.medidaInformacaoId) {
            setError('Selecione a medida de informação');
            return;
        }
        if (isCombinado && (!entity.dimensaoCombinadoId || !entity.medidaCombinadoId)) {
            setError('Para tipo Combinado, selecione dimensão e medida combinados');
            return;
        }

        const payload = {
            nome: entity.nome,
            estruturaId: entity.estruturaId,
            tipo: entity.tipo,
            ordemGrafico: entity.ordemGrafico,
            limite: entity.limite,
            tipoEixo: entity.tipoEixo,
            formatoData: entity.formatoData,
            posicao: entity.posicao,
            colunaLegenda: entity.colunaLegenda,
            coluna: entity.coluna,
            altura: entity.altura,
            diametro: entity.diametro,
            margem: entity.margem,
            exibirValor: entity.exibirValor,
            exibirLegenda: entity.exibirLegenda,
            exibirPercentual: entity.exibirPercentual,
            valorAcumulado: entity.valorAcumulado,
            dimensaoReferenciaId: entity.dimensaoReferenciaId,
            medidaInformacaoId: entity.medidaInformacaoId,
            dimensaoCombinadoId: entity.dimensaoCombinadoId,
            medidaCombinadoId: entity.medidaCombinadoId,
            todosUsuarios: usuarios.length === 0,
            todosUnidades: unidades.length === 0,
            todosPerfis: perfis.length === 0,
        };

        setSalvando(true);
        try {
            if (editingId) {
                await updateGrafico(editingId, payload);
            } else {
                await saveGrafico(payload);
            }
            alert('Gráfico salvo com sucesso!');
            navigate('/view/relatorios/listGrafico');
        } catch (err) {
            console.error('Erro ao salvar gráfico:', err);
            setError('Erro ao salvar gráfico');
        } finally {
            setSalvando(false);
        }
    };

    const voltar = () => navigate('/view/relatorios/listGrafico');

    const eixoActions: DataTableRowAction[] = [
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-minus" />, className: 'btnred', onClick: removeEixo},
    ];

    const filtroActions: DataTableRowAction[] = [
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-trash" />, className: 'btnred', onClick: removeFiltro},
    ];

    const permissaoSubTabs: Array<{key: 'usuarios' | 'unidades' | 'perfis'; label: string; content: ReactNode}> = [
        {
            key: 'usuarios',
            label: 'Usuários',
            content: (
                <div>
                    <MasterDetail
                        label="Usuário"
                        source={USUARIO_SOURCE}
                        valueKey="id"
                        searchKeys={USUARIO_SEARCH}
                        columns={USUARIO_COLUMNS}
                        items={usuarios}
                        onChange={setUsuarios}
                    />
                </div>
            ),
        },
        {
            key: 'unidades',
            label: 'Unidades',
            content: (
                <div>
                    <MasterDetail
                        label="Unidade"
                        source={UNIDADE_SOURCE}
                        valueKey="id"
                        searchKeys={UNIDADE_SEARCH}
                        columns={UNIDADE_COLUMNS}
                        items={unidades}
                        onChange={setUnidades}
                    />
                </div>
            ),
        },
        {
            key: 'perfis',
            label: 'Perfis',
            content: (
                <div>
                    <MasterDetail
                        label="Perfil"
                        source={PERFIL_SOURCE}
                        valueKey="id"
                        searchKeys={PERFIL_SEARCH}
                        columns={PERFIL_COLUMNS}
                        items={perfis}
                        onChange={setPerfis}
                    />
                </div>
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
                    placeholder="Nome do relatório"
                />
            </label>
            <label className="form-field">
                <span className="form-label">Estrutura {requiredMark}</span>
                <select
                    className="form-input form-select"
                    value={entity.estruturaId ?? ''}
                    onChange={(e) => handleEstruturaChange(e.target.value ? Number(e.target.value) : undefined)}
                >
                    <option value="">-- Selecione --</option>
                    {estruturas.map((es) => (
                        <option key={es.id} value={String(es.id)}>{optionLabel(es, ['nome', 'descricao'])}</option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                <span className="form-label">Tipo Gráfico {requiredMark}</span>
                <select
                    className="form-input form-select"
                    value={entity.tipo ?? ''}
                    onChange={(e) => handleTipoGraficoChange(e.target.value)}
                >
                    <option value="">-- Selecione --</option>
                    {TIPO_GRAFICO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                <span className="form-label">Ordenação</span>
                <select
                    className="form-input form-select"
                    value={entity.ordemGrafico ?? ''}
                    onChange={(e) => upd({ordemGrafico: e.target.value})}
                >
                    <option value="">-- Selecione --</option>
                    {TIPO_ORDEM_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                <span className="form-label">Limite Gráfico</span>
                <input
                    className="form-input"
                    type="number"
                    min={1}
                    max={50}
                    value={entity.limite ?? ''}
                    onChange={(e) => upd({limite: e.target.value === '' ? undefined : Number(e.target.value)})}
                />
                <small style={{color: '#666', display: 'block', fontSize: 11}}>Limite máximo de 50 registros para exibir no gráfico</small>
            </label>
            <label className="form-field">
                <span className="form-label">Tipo Eixo</span>
                <select
                    className="form-input form-select"
                    value={String(entity.tipoEixo ?? 0)}
                    onChange={(e) => handleTipoEixoChange(Number(e.target.value))}
                >
                    <option value="0">Simples</option>
                    <option value="1">Multi Eixo</option>
                </select>
            </label>

            <div className="form-section-title" style={{gridColumn: '1 / -1'}}>Eixo do Gráfico</div>

            <label className="form-field">
                <span className="form-label">Dimensão Referência {isTipoEixoSimples && requiredMark}</span>
                <select
                    className="form-input form-select"
                    value={entity.dimensaoReferenciaId ?? ''}
                    onChange={(e) => upd({dimensaoReferenciaId: e.target.value ? Number(e.target.value) : undefined})}
                >
                    <option value="">-- Selecione --</option>
                    {dimensoesDisponiveis.map((d) => (
                        <option key={d.id} value={String(d.id)}>{optionLabel(d)}</option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                <span className="form-label">Medida Informação {isTipoEixoSimples && requiredMark}</span>
                <select
                    className="form-input form-select"
                    value={entity.medidaInformacaoId ?? ''}
                    onChange={(e) => upd({medidaInformacaoId: e.target.value ? Number(e.target.value) : undefined})}
                >
                    <option value="">-- Selecione --</option>
                    {medidasDisponiveis.map((m) => (
                        <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                    ))}
                </select>
            </label>
            {isCombinado && (
                <>   
                    <label className="form-field">
                        <span className="form-label">Dimensão Combinado</span>
                        <select
                            className="form-input form-select"
                            value={entity.dimensaoCombinadoId ?? ''}
                            onChange={(e) => upd({dimensaoCombinadoId: e.target.value ? Number(e.target.value) : undefined})}
                        >
                            <option value="">-- Selecione --</option>
                            {dimensoesDisponiveis.map((d) => (
                                <option key={d.id} value={String(d.id)}>{optionLabel(d)}</option>
                            ))}
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Medida Combinado</span>
                        <select
                            className="form-input form-select"
                            value={entity.medidaCombinadoId ?? ''}
                            onChange={(e) => upd({medidaCombinadoId: e.target.value ? Number(e.target.value) : undefined})}
                        >
                            <option value="">-- Selecione --</option>
                            {medidasDisponiveis.map((m) => (
                                <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                            ))}
                        </select>
                    </label>
                </>
            )}
            <label className="form-field">
                <span className="form-label">Exibir Valor</span>
                <BooleanField value={Boolean(entity.exibirValor)} onChange={(v) => upd({exibirValor: v})} onText="Sim" offText="Não" />
            </label>
            <label className="form-field">
                <span className="form-label">Exibir Legenda</span>
                <BooleanField value={Boolean(entity.exibirLegenda)} onChange={(v) => upd({exibirLegenda: v})} onText="Sim" offText="Não" />
            </label>
            {isPizzaOuCircular && (
                <label className="form-field">
                    <span className="form-label">Exibir Percentual</span>
                    <BooleanField value={Boolean(entity.exibirPercentual)} onChange={(v) => upd({exibirPercentual: v})} onText="Sim" offText="Não" />
                </label>
            )}
            {isBarra && (
                <label className="form-field">
                    <span className="form-label">Acumulado</span>
                    <BooleanField value={Boolean(entity.valorAcumulado)} onChange={(v) => upd({valorAcumulado: v})} onText="Sim" offText="Não" />
                </label>
            )}
            {entity.exibirLegenda !== false && (
                <label className="form-field">
                    <span className="form-label">Posição Legenda</span>
                    <select
                        className="form-input form-select"
                        value={entity.posicao ?? ''}
                        onChange={(e) => upd({posicao: e.target.value})}
                    >
                        <option value="">-- Selecione --</option>
                        {POSICAO_LEGENDA_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </label>
            )}
            {entity.exibirLegenda !== false && (
                <label className="form-field">
                    <span className="form-label">Coluna Legenda</span>
                    <input
                        className="form-input"
                        type="number"
                        value={entity.colunaLegenda ?? ''}
                        onChange={(e) => upd({colunaLegenda: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                </label>
            )}
            {isPizzaOuCircular && (
                <label className="form-field">
                    <span className="form-label">Coluna Gráfico</span>
                    <input
                        className="form-input"
                        type="number"
                        value={entity.coluna ?? ''}
                        onChange={(e) => upd({coluna: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                </label>
            )}
            <label className="form-field">
                <span className="form-label">Altura Gráfico</span>
                <input
                    className="form-input"
                    type="number"
                    value={entity.altura ?? ''}
                    onChange={(e) => upd({altura: e.target.value === '' ? undefined : Number(e.target.value)})}
                />
            </label>
            {entity.tipo === 'PIZZA' && (
                <label className="form-field">
                    <span className="form-label">Diâmetro</span>
                    <input
                        className="form-input"
                        type="number"
                        value={entity.diametro ?? ''}
                        onChange={(e) => upd({diametro: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                </label>
            )}
            {entity.tipo === 'CIRCULAR' && (
                <label className="form-field">
                    <span className="form-label">Margem Separação</span>
                    <input
                        className="form-input"
                        type="number"
                        value={entity.margem ?? ''}
                        onChange={(e) => upd({margem: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                </label>
            )}
            {showFormatoData && (
                <label className="form-field">
                    <span className="form-label">Formato Data</span>
                    <select
                        className="form-input form-select"
                        value={entity.formatoData ?? ''}
                        onChange={(e) => upd({formatoData: e.target.value})}
                    >
                        <option value="">-- Selecione --</option>
                        {FORMATO_DATA_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </label>
            )}

            {isMultiEixo && (
                <div style={{gridColumn: '1 / -1', borderTop: '1px solid #e6e6e6', marginTop: 16, paddingTop: 16}}>
                    <div className="form-section-title">Eixos do Gráfico</div>
                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">Dimensão Informação</span>
                            <select
                                className="form-input form-select"
                                value={eixoDimensaoId}
                                onChange={(e) => setEixoDimensaoId(e.target.value)}
                            >
                                <option value="">-- Selecione --</option>
                                {dimensoesDisponiveis.map((d) => (
                                    <option key={d.id} value={String(d.id)}>{optionLabel(d)}</option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Medida Informação</span>
                            <select
                                className="form-input form-select"
                                value={eixoMedidaId}
                                onChange={(e) => setEixoMedidaId(e.target.value)}
                            >
                                <option value="">-- Selecione --</option>
                                {medidasDisponiveis.map((m) => (
                                    <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Tipo do Eixo</span>
                            <select
                                className="form-input form-select"
                                value={eixoTipo}
                                onChange={(e) => setEixoTipo(e.target.value)}
                            >
                                {TIPO_GRAFICO_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </label>
                        <div className="form-field" style={{gridColumn: '1 / -1'}}>
                            <button type="button" className="btnblue" onClick={addEixo}>＋ Adicionar Eixo</button>
                        </div>
                    </div>
                    <DataTable
                        data={graficoEixos}
                        columns={GRAFICO_EIXO_COLUMNS}
                        extraRowActions={eixoActions}
                        hideCreate
                        hideUpdate
                        hideDelete
                        hideView
                    />
                </div>
            )}
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
                                    Relatório de Gráfico — {editingId ? 'Edição' : 'Cadastro'}
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