import {useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {Tabs} from '../../../shared/components/Tabs';
import {MasterDetail} from '../../../shared/components/MasterDetail';
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

const TABELA_COLUNAS_COLUMNS: DataTableColumn[] = [
    {key: 'dimensaoNome', label: 'Dimensão'},
    {key: 'medidaNome', label: 'Medida'},
    {key: 'dimensaoTipo', label: 'Tipo Dimensão'},
    {key: 'medidaTipo', label: 'Tipo Medida'},
];

interface TabelaEntity {
    id?: number;
    nome?: string;
    estruturaId?: number;
}

const requiredMark = <span style={{color: '#C90000', marginLeft: 4}}>*</span>;

const optionLabel = (item: any, fallbackKeys: string[] = ['nomeVisualizacao', 'nome']) => {
    for (const key of fallbackKeys) {
        const value = item?.[key];
        if (typeof value === 'string' && value) return value;
    }
    return `#${String(item?.id ?? '')}`;
};

export default function ViewRelatoriosFormTabelaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    const [entity, setEntity] = useState<TabelaEntity>({});
    const [estruturaSelecionada, setEstruturaSelecionada] = useState<any>(null);
    const [dimensoesDescritivas, setDimensoesDescritivas] = useState<any[]>([]);
    const [dimensoesTempo, setDimensoesTempo] = useState<any[]>([]);
    const [medidas, setMedidas] = useState<any[]>([]);
    const [tabelaColunas, setTabelaColunas] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);

    const [estruturas, setEstruturas] = useState<any[]>([]);
    const [dimensoes, setDimensoes] = useState<any[]>([]);
    const [medidasDisponiveis, setMedidasDisponiveis] = useState<any[]>([]);

    const [dimensaoDescId, setDimensaoDescId] = useState('');
    const [dimensaoTempoId, setDimensaoTempoId] = useState('');
    const [medidaId, setMedidaId] = useState('');
    const [colunaDimensaoId, setColunaDimensaoId] = useState('');
    const [colunaMedidaId, setColunaMedidaId] = useState('');

    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensaoId, setFiltroDimensaoId] = useState('');

    const [permissaoSub, setPermissaoSub] = useState<'usuarios' | 'unidades' | 'perfis'>('usuarios');

    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const {post: saveTabela} = useApi(API_PATHS.relatorios.tabela);
    const {put: updateTabela} = useApi(API_PATHS.relatorios.tabela);
    const {post: saveFiltro} = useApi(API_PATHS.relatorios.filtro);
    const {delete: deleteFiltro} = useApi(API_PATHS.relatorios.filtro);

    const upd = (patch: Partial<TabelaEntity>) => setEntity((prev) => ({...prev, ...patch}));

    const loadTabelaPorId = async (id: number) => (await api.get(`${API_PATHS.relatorios.tabela}/${id}`)).data;

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
                if (Array.isArray(data)) setMedidasDisponiveis(data);
            } catch (error) {
                console.error('Erro ao carregar medidas:', error);
            }
        })();
    }, []);

    useEffect(() => {
        if (editingId) {
            loadTabelaPorId(editingId)
                .then(async (tabela: any) => {
                    setEntity(tabela);
                    if (Array.isArray(tabela?.colunas)) setTabelaColunas(tabela.colunas);
                    if (tabela?.estruturaId) await loadEstruturaPorId(tabela.estruturaId);
                })
                .catch((error) => console.error('Erro ao carregar tabela:', error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const handleEstruturaChange = (id: number | undefined) => {
        upd({estruturaId: id ?? undefined});
        setEstruturaSelecionada(null);
        setDimensoesDescritivas([]);
        setDimensoesTempo([]);
        setMedidas([]);
        setTabelaColunas([]);
        if (id) loadEstruturaPorId(id);
    };

    const dimensoesEstrutura = entity.estruturaId ? dimensoes.filter((d) => d.estruturaId === entity.estruturaId) : dimensoes;
    const dimensoesDescEstrutura = dimensoesEstrutura.filter((d) => d.tipoInfo !== 'TEMPO');
    const dimensoesTempoEstrutura = dimensoesEstrutura.filter((d) => d.tipoInfo === 'TEMPO');
    const medidasEstrutura = entity.estruturaId ? medidasDisponiveis.filter((m) => m.estruturaId === entity.estruturaId) : medidasDisponiveis;

    const addDimensaoDescritiva = () => {
        const dim = dimensoesDescEstrutura.find((d) => String(d.id) === dimensaoDescId);
        if (!dim) {
            alert('Selecione uma dimensão descritiva');
            return;
        }
        if (dimensoesDescritivas.some((d) => d.id === dim.id)) {
            alert('Dimensão descritiva já adicionada');
            return;
        }
        setDimensoesDescritivas((prev) => [...prev, dim]);
        setDimensaoDescId('');
    };

    const removeDimensaoDescritiva = (item: any) => {
        setDimensoesDescritivas((prev) => prev.filter((d) => d.id !== item.id));
    };

    const addDimensaoTempo = () => {
        const dim = dimensoesTempoEstrutura.find((d) => String(d.id) === dimensaoTempoId);
        if (!dim) {
            alert('Selecione uma dimensão de tempo');
            return;
        }
        if (dimensoesTempo.some((d) => d.id === dim.id)) {
            alert('Dimensão de tempo já adicionada');
            return;
        }
        setDimensoesTempo((prev) => [...prev, dim]);
        setDimensaoTempoId('');
    };

    const removeDimensaoTempo = (item: any) => {
        setDimensoesTempo((prev) => prev.filter((d) => d.id !== item.id));
    };

    const addMedida = () => {
        const med = medidasEstrutura.find((m) => String(m.id) === medidaId);
        if (!med) {
            alert('Selecione uma medida');
            return;
        }
        if (medidas.some((m) => m.id === med.id)) {
            alert('Medida já adicionada');
            return;
        }
        setMedidas((prev) => [...prev, med]);
        setMedidaId('');
    };

    const removeMedida = (item: any) => {
        setMedidas((prev) => prev.filter((m) => m.id !== item.id));
    };

    const addColuna = () => {
        const dim = dimensoesDescritivas.find((d) => String(d.id) === colunaDimensaoId);
        if (!dim) {
            alert('Selecione a dimensão da coluna');
            return;
        }
        const med = medidas.find((m) => String(m.id) === colunaMedidaId);
        if (!med) {
            alert('Selecione a medida da coluna');
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
        setColunaDimensaoId('');
        setColunaMedidaId('');
    };

    const removeColuna = (coluna: any) => {
        setTabelaColunas((prev) => prev.filter((c) => c !== coluna));
    };

    const moveColuna = (index: number, dir: -1 | 1) => {
        setTabelaColunas((prev) => {
            const target = index + dir;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
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

        const payload = {
            nome: entity.nome,
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

        setSalvando(true);
        try {
            if (editingId) {
                await updateTabela(editingId, payload);
            } else {
                await saveTabela(payload);
            }
            alert('Tabela salva com sucesso!');
            navigate('/view/relatorios/listTabela');
        } catch (err) {
            console.error('Erro ao salvar tabela:', err);
            setError('Erro ao salvar tabela');
        } finally {
            setSalvando(false);
        }
    };

    const voltar = () => navigate('/view/relatorios/listTabela');

    const dimensaoActions: DataTableRowAction[] = [
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-minus" />, className: 'btnred', onClick: removeDimensaoDescritiva},
    ];
    const dimensaoTempoActions: DataTableRowAction[] = [
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-minus" />, className: 'btnred', onClick: removeDimensaoTempo},
    ];
    const medidaActions: DataTableRowAction[] = [
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-minus" />, className: 'btnred', onClick: removeMedida},
    ];
    const colunaActions: DataTableRowAction[] = [
        {key: 'up', title: 'Subir', icon: <i className="fa fa-arrow-up" />, onClick: (item: any) => moveColuna(tabelaColunas.indexOf(item), -1)},
        {key: 'down', title: 'Descer', icon: <i className="fa fa-arrow-down" />, onClick: (item: any) => moveColuna(tabelaColunas.indexOf(item), 1)},
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-minus" />, className: 'btnred', onClick: removeColuna},
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

            {estruturaSelecionada?.nome && (
                <div className="form-field" style={{gridColumn: '1 / -1'}}>
                    <small style={{color: '#666', fontSize: 12}}>
                        Estrutura selecionada: <strong>{estruturaSelecionada.nome}</strong>
                    </small>
                </div>
            )}

            <div style={{gridColumn: '1 / -1', marginTop: 8}}>
                <Tabs
                    tabs={[
                        {
                            key: 'descritiva',
                            label: 'Dimensão Descritiva',
                            content: (
                                <div className="form-grid">
                                    <label className="form-field">
                                        <span className="form-label">Adicionar Dimensão Descritiva</span>
                                        <select
                                            className="form-input form-select"
                                            value={dimensaoDescId}
                                            onChange={(e) => setDimensaoDescId(e.target.value)}
                                        >
                                            <option value="">-- Selecione --</option>
                                            {dimensoesDescEstrutura
                                                .filter((d) => !dimensoesDescritivas.some((sel) => sel.id === d.id))
                                                .map((d) => (
                                                    <option key={d.id} value={String(d.id)}>{optionLabel(d)}</option>
                                                ))}
                                        </select>
                                    </label>
                                    <div className="form-field" style={{alignSelf: 'end'}}>
                                        <button type="button" className="btnblue" onClick={addDimensaoDescritiva} disabled={!dimensaoDescId}>
                                            ＋ Adicionar
                                        </button>
                                    </div>
                                    <div style={{gridColumn: '1 / -1'}}>
                                        <DataTable
                                            data={dimensoesDescritivas}
                                            columns={[
                                                {key: 'id', label: 'ID'},
                                                {key: 'nomeVisualizacao', label: 'Dimensão Descritiva'},
                                            ]}
                                            extraRowActions={dimensaoActions}
                                            hideCreate
                                            hideUpdate
                                            hideDelete
                                            hideView
                                        />
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'tempo',
                            label: 'Dimensão Tempo',
                            content: (
                                <div className="form-grid">
                                    <label className="form-field">
                                        <span className="form-label">Adicionar Dimensão Tempo</span>
                                        <select
                                            className="form-input form-select"
                                            value={dimensaoTempoId}
                                            onChange={(e) => setDimensaoTempoId(e.target.value)}
                                        >
                                            <option value="">-- Selecione --</option>
                                            {dimensoesTempoEstrutura
                                                .filter((d) => !dimensoesTempo.some((sel) => sel.id === d.id))
                                                .map((d) => (
                                                    <option key={d.id} value={String(d.id)}>{optionLabel(d)}</option>
                                                ))}
                                        </select>
                                    </label>
                                    <div className="form-field" style={{alignSelf: 'end'}}>
                                        <button type="button" className="btnblue" onClick={addDimensaoTempo} disabled={!dimensaoTempoId}>
                                            ＋ Adicionar
                                        </button>
                                    </div>
                                    <div style={{gridColumn: '1 / -1'}}>
                                        <DataTable
                                            data={dimensoesTempo}
                                            columns={[
                                                {key: 'id', label: 'ID'},
                                                {key: 'nomeVisualizacao', label: 'Dimensão Tempo'},
                                            ]}
                                            extraRowActions={dimensaoTempoActions}
                                            hideCreate
                                            hideUpdate
                                            hideDelete
                                            hideView
                                        />
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'medidas',
                            label: 'Medidas',
                            content: (
                                <div className="form-grid">
                                    <label className="form-field">
                                        <span className="form-label">Adicionar Medida</span>
                                        <select
                                            className="form-input form-select"
                                            value={medidaId}
                                            onChange={(e) => setMedidaId(e.target.value)}
                                        >
                                            <option value="">-- Selecione --</option>
                                            {medidasEstrutura
                                                .filter((m) => !medidas.some((sel) => sel.id === m.id))
                                                .map((m) => (
                                                    <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                                                ))}
                                        </select>
                                    </label>
                                    <div className="form-field" style={{alignSelf: 'end'}}>
                                        <button type="button" className="btnblue" onClick={addMedida} disabled={!medidaId}>
                                            ＋ Adicionar
                                        </button>
                                    </div>
                                    <div style={{gridColumn: '1 / -1'}}>
                                        <DataTable
                                            data={medidas}
                                            columns={[
                                                {key: 'id', label: 'ID'},
                                                {key: 'nomeVisualizacao', label: 'Medida'},
                                            ]}
                                            extraRowActions={medidaActions}
                                            hideCreate
                                            hideUpdate
                                            hideDelete
                                            hideView
                                        />
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'colunas',
                            label: 'Colunas da Tabela',
                            content: (
                                <div className="form-grid">
                                    <label className="form-field">
                                        <span className="form-label">Dimensão da Coluna</span>
                                        <select
                                            className="form-input form-select"
                                            value={colunaDimensaoId}
                                            onChange={(e) => setColunaDimensaoId(e.target.value)}
                                        >
                                            <option value="">-- Selecione --</option>
                                            {dimensoesDescritivas.map((d) => (
                                                <option key={d.id} value={String(d.id)}>{optionLabel(d)}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Medida da Coluna</span>
                                        <select
                                            className="form-input form-select"
                                            value={colunaMedidaId}
                                            onChange={(e) => setColunaMedidaId(e.target.value)}
                                        >
                                            <option value="">-- Selecione --</option>
                                            {medidas.map((m) => (
                                                <option key={m.id} value={String(m.id)}>{optionLabel(m)}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <div className="form-field" style={{alignSelf: 'end'}}>
                                        <button
                                            type="button"
                                            className="btnblue"
                                            onClick={addColuna}
                                            disabled={!colunaDimensaoId || !colunaMedidaId}
                                        >
                                            ＋ Adicionar Coluna
                                        </button>
                                    </div>
                                    <div style={{gridColumn: '1 / -1'}}>
                                        <DataTable
                                            data={tabelaColunas}
                                            columns={TABELA_COLUNAS_COLUMNS}
                                            extraRowActions={colunaActions}
                                            hideCreate
                                            hideUpdate
                                            hideDelete
                                            hideView
                                        />
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                    initial="descritiva"
                />
            </div>
        </div>
    );

    const tabPermissao = (
        <div className="form-grid">
            <div style={{gridColumn: '1 / -1', display: 'flex', gap: 8, borderBottom: '1px solid #e0e0e0', marginBottom: 16}}>
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
                            {dimensoesEstrutura.map((d) => (
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
                                    Relatório de Tabela — {editingId ? 'Edição' : 'Cadastro'}
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