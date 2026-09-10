import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';
import {AutoComplete, type AutoCompleteOption} from '../../../shared/components/AutoComplete';
import {MasterDetail} from '../../../shared/components/MasterDetail';
import type {ApiItem} from '../../../shared/types/types';
import {
    ESTRUTURA_SOURCE,
    ESTRUTURA_COLUMNS,
    ESTRUTURA_SEARCH,
    DIMENSAO_SOURCE,
    DIMENSAO_COLUMNS,
    DIMENSAO_SEARCH,
    TABELA_SOURCE,
    TABELA_COLUMNS,
    TABELA_SEARCH,
    GRAFICO_SOURCE,
    GRAFICO_COLUMNS,
    GRAFICO_SEARCH,
    MAPA_SOURCE,
    MAPA_COLUMNS,
    MAPA_SEARCH,
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
} from '../../../shared/services/masterDetailSources';

const TIPO_FILTRO_OPCOES = ['NENHUM', 'NORMAL', 'FAIXA', 'PERIODICO', 'FIXO', 'MULTIPLO'] as const;
const OPERACAO_OPCOES = ['EQ', 'NOT_EQUAL', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL'] as const;

const ITEM_COLUMNS = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
] as const;

const ItemList: React.FC<{
    items: {id: number; nome: string}[];
    onRemove: (id: number) => void;
}> = ({items, onRemove}) => (
    <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <tbody>
        {items.length === 0 ? (
            <tr><td style={{padding: 8, color: '#6b7280'}}>Nenhum registro selecionado.</td></tr>
        ) : (
            items.map((item) => (
                <tr key={item.id}>
                    <td style={{border: '1px solid #e5e7eb', padding: 6}}>{item.id}</td>
                    <td style={{border: '1px solid #e5e7eb', padding: 6}}>{item.nome}</td>
                    <td style={{border: '1px solid #e5e7eb', padding: 6, textAlign: 'right'}}>
                        <button type="button" className="btnred" onClick={() => onRemove(item.id)}>remover</button>
                    </td>
                </tr>
            ))
        )}
        </tbody>
    </table>
);

interface Relacoes {
    informacoes: string[];
    tabelas: {id: number; nome: string}[];
    graficos: {id: number; nome: string}[];
    mapas: {id: number; nome: string}[];
    organogramas: {id: number; nome: string}[];
    usuarios: {id: number; label: string}[];
    unidades: {id: number; label: string}[];
    perfis: {id: number; label: string}[];
}

const asOption = (item: {id?: number; nome?: string}): AutoCompleteOption =>
    ({id: Number(item?.id), label: String(item?.nome ?? '')});

const buildFetch = (path: string) => async (query: string): Promise<AutoCompleteOption[]> => {
    const res = await api.get(path, {params: {query}});
    const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
    return list
        .filter((x) => x && x.id != null)
        .map((x) => ({id: Number(x.id), label: String(x.nome ?? x.nomeVisualizacao ?? x.login ?? x.descricao ?? `#${x.id}`)}));
};

const buildFetchById = (path: string) => async (id: number): Promise<AutoCompleteOption | null> => {
    try {
        const res = await api.get(`${path}/${id}`);
        const x = res.data ?? {};
        return x.id != null
            ? {id: Number(x.id), label: String(x.nome ?? x.nomeVisualizacao ?? x.login ?? x.descricao ?? `#${x.id}`)}
            : null;
    } catch {
        return null;
    }
};

const AutoCompleteItem: React.FC<{
    label: string;
    path: string;
    value: AutoCompleteOption | null;
    onChange: (o: AutoCompleteOption | null) => void;
}> = ({label, path, value, onChange}) => (
    <AutoComplete
        label={label}
        value={value}
        onChange={onChange}
        fetchOptions={buildFetch(path)}
        fetchById={buildFetchById(path)}
    />
);

export default function ViewFiltrosFormFiltrosListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editingId = (() => {
        const id = searchParams.get('id');
        const n = id ? Number(id) : NaN;
        return Number.isNaN(n) ? null : n;
    })();
    const isEdit = editingId !== null;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Campos principais (rel_filtro)
    const [nome, setNome] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState<string>('NENHUM');
    const [informacao, setInformacao] = useState('');
    const [valorFixo, setValorFixo] = useState('');
    const [operacao, setOperacao] = useState<string>('EQ');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [periodoDinamico, setPeriodoDinamico] = useState('');
    const [flFixo, setFlFixo] = useState(false);
    const [flExibir, setFlExibir] = useState(false);
    const [flTodosGrafico, setFlTodosGrafico] = useState(false);
    const [flTodosTabela, setFlTodosTabela] = useState(false);
    const [flTodosMapa, setFlTodosMapa] = useState(false);
    const [flTodosOrganograma, setFlTodosOrganograma] = useState(false);
    const [flRede, setFlRede] = useState(false);
    const [flHierarquia, setFlHierarquia] = useState(false);
    const [hierarquia, setHierarquia] = useState('');

    const [estrutura, setEstrutura] = useState<AutoCompleteOption | null>(null);
    const [dimensao, setDimensao] = useState<AutoCompleteOption | null>(null);

    // Relações
    const [addTabela, setAddTabela] = useState<AutoCompleteOption | null>(null);
    const [addGrafico, setAddGrafico] = useState<AutoCompleteOption | null>(null);
    const [addMapa, setAddMapa] = useState<AutoCompleteOption | null>(null);
    const [addOrganograma, setAddOrganograma] = useState<AutoCompleteOption | null>(null);

    const [tabelas, setTabelas] = useState<{id: number; nome: string}[]>([]);
    const [graficos, setGraficos] = useState<{id: number; nome: string}[]>([]);
    const [mapas, setMapas] = useState<{id: number; nome: string}[]>([]);
    const [organogramas, setOrganogramas] = useState<{id: number; nome: string}[]>([]);
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [informacoes, setInformacoes] = useState<string[]>([]);
    const [novaInformacao, setNovaInformacao] = useState('');

    useEffect(() => {
        if (!isEdit) return;
        setLoading(true);
        setError('');
        api.get<Record<string, any>>(`/api/view/filtros/listFiltros/${editingId}`)
            .then((res) => {
                const row = res.data ?? {};
                setNome(String(row.nome ?? ''));
                setTipoFiltro(String(row.tipo_filtro ?? row.tipoFiltro ?? 'NENHUM'));
                setInformacao(String(row.informacao ?? ''));
                setValorFixo(String(row.valor_fixo ?? row.valorFixo ?? ''));
                setOperacao(String(row.operacao ?? 'EQ'));
                setDataInicio(String(row.data_inicio ?? ''));
                setDataFim(String(row.data_fim ?? ''));
                setPeriodoDinamico(String(row.periodo_dinamico ?? ''));
                setFlFixo(Boolean(row.fl_fixo ?? row.flFixo));
                setFlExibir(Boolean(row.fl_exibir ?? row.flExibir));
                setFlTodosGrafico(Boolean(row.fl_todos_grafico ?? row.flTodosGrafico));
                setFlTodosTabela(Boolean(row.fl_todos_tabela ?? row.flTodosTabela));
                setFlTodosMapa(Boolean(row.fl_todos_mapa ?? row.flTodosMapa));
                setFlTodosOrganograma(Boolean(row.fl_todos_organograma ?? row.flTodosOrganograma));
                setFlRede(Boolean(row.fl_rede ?? row.flRede));
                setFlHierarquia(Boolean(row.fl_hierarquia ?? row.flHierarquia));
                setHierarquia(String(row.hierarquia ?? ''));
                if (row.id_estrutura != null || row.estruturaId != null) {
                    setEstrutura({id: Number(row.id_estrutura ?? row.estruturaId), label: String(row.estruturaNome ?? row.nomeEstrutura ?? '')});
                }
                if (row.id_dimensao != null || row.dimensaoId != null) {
                    setDimensao({id: Number(row.id_dimensao ?? row.dimensaoId), label: String(row.dimensaoNome ?? row.nomeDimVisualizacao ?? '')});
                }
            })
            .catch((e: any) => setError(e?.response?.data?.error ?? e?.message ?? 'Erro ao carregar filtro.'))
            .finally(() => setLoading(false));

        api.get<Relacoes>(`/api/relatorios/filtros/${editingId}/relacoes`)
            .then((res) => {
                const r = res.data ?? {} as any;
                setInformacoes(Array.isArray(r.informacoes) ? r.informacoes : []);
                setTabelas(Array.isArray(r.tabelas) ? r.tabelas : []);
                setGraficos(Array.isArray(r.graficos) ? r.graficos : []);
                setMapas(Array.isArray(r.mapas) ? r.mapas : []);
                setOrganogramas(Array.isArray(r.organogramas) ? r.organogramas : []);
                setUsuarios((Array.isArray(r.usuarios) ? r.usuarios : []).map((u: any) => ({id: u?.id, label: u?.label ?? `#${u?.id}`})));
                setUnidades((Array.isArray(r.unidades) ? r.unidades : []).map((u: any) => ({id: u?.id, label: u?.label ?? `#${u?.id}`})));
                setPerfis((Array.isArray(r.perfis) ? r.perfis : []).map((p: any) => ({id: p?.id, label: p?.label ?? `#${p?.id}`})));
            })
            .catch((e: any) => setError(e?.response?.data?.error ?? e?.message ?? 'Erro ao carregar relações.'));
    }, [editingId, isEdit]);

    const validate = (): string | null => {
        if (!nome.trim()) return 'Nome é obrigatório.';
        if (nome.trim().length < 3) return 'Nome deve ter no mínimo 3 caracteres.';
        if (!tipoFiltro) return 'Tipo é obrigatório.';
        if (estrutura == null) return 'Estrutura é obrigatória.';
        if (dimensao == null) return 'Dimensão é obrigatória.';
        return null;
    };

    const saveRelations = async (id: number) => {
        const body = {
            informacoes,
            tabelasIds: tabelas.map((t) => t.id),
            graficosIds: graficos.map((g) => g.id),
            mapasIds: mapas.map((m) => m.id),
            organogramasIds: organogramas.map((o) => o.id),
            usuariosIds: (usuarios as any[]).map((u) => Number(u.id)).filter(Boolean),
            unidadesIds: (unidades as any[]).map((u) => Number(u.id)).filter(Boolean),
            perfisIds: (perfis as any[]).map((p) => Number(p.id)).filter(Boolean),
        };
        await api.put(`/api/relatorios/filtros/${id}/relacoes`, body);
    };

    const handleSave = async () => {
        const msg = validate();
        if (msg) {
            setError(msg);
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        const body: Record<string, unknown> = {
            nome: nome.trim(),
            tipo_filtro: tipoFiltro,
            informacao: informacao || null,
            valor_fixo: valorFixo || null,
            operacao: operacao || null,
            data_inicio: dataInicio || null,
            data_fim: dataFim || null,
            periodo_dinamico: periodoDinamico || null,
            fl_fixo: flFixo,
            fl_exibir: flExibir,
            fl_todos_grafico: flTodosGrafico,
            fl_todos_tabela: flTodosTabela,
            fl_todos_mapa: flTodosMapa,
            fl_todos_organograma: flTodosOrganograma,
            fl_rede: flRede,
            fl_hierarquia: flHierarquia,
            hierarquia: hierarquia || null,
            id_estrutura: estrutura?.id,
            id_dimensao: dimensao?.id,
        };
        try {
            let id = editingId;
            if (isEdit) {
                await api.put(`/api/view/filtros/listFiltros/${editingId}`, body);
            } else {
                const res = await api.post('/api/view/filtros/createOrUpdate', body).catch(() => api.post('/api/view/filtros/formFiltros', body));
                const data: any = res.data ?? {};
                id = Number(data.id ?? editingId) || null;
                if (id === null || Number.isNaN(id)) throw new Error('Não foi possível obter o id do filtro criado.');
            }
            await saveRelations(id);
            setSuccess(isEdit ? 'Filtro atualizado com sucesso.' : 'Filtro criado com sucesso.');
            setTimeout(() => navigate('/view/filtros/listFiltros'), 800);
        } catch (e: any) {
            setError(e?.response?.data?.error ?? e?.message ?? 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const addInformacao = () => {
        const v = novaInformacao.trim();
        if (!v) return;
        if (!informacoes.includes(v)) setInformacoes([...informacoes, v]);
        setNovaInformacao('');
    };

    const inputStyle: React.CSSProperties = {
        border: '1px solid #d1d5db',
        borderRadius: 6,
        padding: '6px 10px',
        fontSize: 14,
        width: '100%',
        boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = {fontWeight: 600, color: '#374151', fontSize: 13};
    const panelStyle: React.CSSProperties = {
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        background: '#fff',
        marginBottom: 16,
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1>{isEdit ? `Editar Filtro #${editingId}` : 'Novo Filtro'}</h1>
                    <button type="button" className="btnblue" onClick={() => navigate('/view/filtros/listFiltros')}>Voltar</button>
                </div>
                <div style={{height: 1, background: '#ddd', margin: '8px 0'}} />
                {error && <div style={{background: '#FDE8E8', border: '1px solid #F5C2C2', color: '#8A1F1F', padding: 10, borderRadius: 6, marginBottom: 12}}>{error}</div>}
                {success && <div style={{background: '#E6F4EA', border: '1px solid #B7E1C6', color: '#1E4620', padding: 10, borderRadius: 6, marginBottom: 12}}>{success}</div>}
                {loading && <p>Carregando...</p>}

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 1200}}>
                    {/* Aba Geral */}
                    <div>
                        <div style={{fontWeight: 700, fontSize: 16, marginBottom: 8}}>Geral</div>
                        <div style={panelStyle}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px'}}>
                                <div>
                                    <label style={labelStyle}>Id</label>
                                    <input style={{...inputStyle, background: '#f3f4f6'}} value={isEdit ? String(editingId) : ''} disabled placeholder="(novo)" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Nome <span style={{color: '#C90000'}}>*</span></label>
                                    <input style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={255} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <AutoCompleteItem label="Estrutura *" path={ESTRUTURA_SOURCE} value={estrutura} onChange={setEstrutura} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <AutoCompleteItem label="Dimensão *" path={DIMENSAO_SOURCE} value={dimensao} onChange={setDimensao} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Tipo</label>
                                    <select style={inputStyle} value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                                        {TIPO_FILTRO_OPCOES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20}}>
                                    <label style={labelStyle}>Fixo</label>
                                    <input type="checkbox" checked={flFixo} onChange={(e) => setFlFixo(e.target.checked)} />
                                    <label style={labelStyle}>Exibir filtro</label>
                                    <input type="checkbox" checked={flExibir} onChange={(e) => setFlExibir(e.target.checked)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Valor fixo</label>
                                    <input style={inputStyle} value={valorFixo} onChange={(e) => setValorFixo(e.target.value)} placeholder="Somente quando tipo = FIXO" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Informação</label>
                                    <input style={inputStyle} value={informacao} onChange={(e) => setInformacao(e.target.value)} />
                                </div>
                                {(tipoFiltro === 'NORMAL' || tipoFiltro === 'FAIXA' || tipoFiltro === 'PERIODICO') && (
                                    <>
                                        <div>
                                            <label style={labelStyle}>Operação</label>
                                            <select style={inputStyle} value={operacao} onChange={(e) => setOperacao(e.target.value)}>
                                                {OPERACAO_OPCOES.map((o) => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Data início</label>
                                            <input type="date" style={inputStyle} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                                        </div>
                                        {tipoFiltro === 'FAIXA' && (
                                            <div>
                                                <label style={labelStyle}>Data fim</label>
                                                <input type="date" style={inputStyle} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                                            </div>
                                        )}
                                        {tipoFiltro === 'PERIODICO' && (
                                            <div>
                                                <label style={labelStyle}>Período dinâmico</label>
                                                <input style={inputStyle} value={periodoDinamico} onChange={(e) => setPeriodoDinamico(e.target.value)} />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={panelStyle}>
                            <div style={{fontWeight: 700, marginBottom: 8}}>Rede</div>
                            <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
                                <label style={labelStyle}>Exibir rede</label>
                                <input type="checkbox" checked={flRede} onChange={(e) => setFlRede(e.target.checked)} />
                                {flRede && (
                                    <>
                                        <label style={labelStyle}>Exibir hierarquia</label>
                                        <input type="checkbox" checked={flHierarquia} onChange={(e) => setFlHierarquia(e.target.checked)} />
                                        {flHierarquia && (
                                            <>
                                                <label style={labelStyle}>Hierarquia</label>
                                                <input style={{...inputStyle, width: 160}} value={hierarquia} onChange={(e) => setHierarquia(e.target.value)} />
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={panelStyle}>
                            <div style={{fontWeight: 700, marginBottom: 8}}>Relatório – todos</div>
                            <div style={{display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap'}}>
                                <label style={labelStyle}>Mapas <input type="checkbox" checked={flTodosMapa} onChange={(e) => setFlTodosMapa(e.target.checked)} /></label>
                                <label style={labelStyle}>Gráficos <input type="checkbox" checked={flTodosGrafico} onChange={(e) => setFlTodosGrafico(e.target.checked)} /></label>
                                <label style={labelStyle}>Tabelas <input type="checkbox" checked={flTodosTabela} onChange={(e) => setFlTodosTabela(e.target.checked)} /></label>
                                <label style={labelStyle}>Organogramas <input type="checkbox" checked={flTodosOrganograma} onChange={(e) => setFlTodosOrganograma(e.target.checked)} /></label>
                            </div>
                        </div>
                    </div>

                    {/* Aba Permissão e Permissão Tiporelatorio */}
                    <div>
                        <div style={{fontWeight: 700, fontSize: 16, marginBottom: 8}}>Permissão</div>
                        <div style={panelStyle}>
                            <MasterDetail label="Usuário" source={USUARIO_SOURCE} valueKey="id" searchKeys={USUARIO_SEARCH} columns={USUARIO_COLUMNS} items={usuarios} onChange={setUsuarios} />
                        </div>
                        <div style={panelStyle}>
                            <MasterDetail label="Unidade" source={UNIDADE_SOURCE} valueKey="id" searchKeys={UNIDADE_SEARCH} columns={UNIDADE_COLUMNS} items={unidades} onChange={setUnidades} />
                        </div>
                        <div style={panelStyle}>
                            <MasterDetail label="Perfil" source={PERFIL_SOURCE} valueKey="id" searchKeys={PERFIL_SEARCH} columns={PERFIL_COLUMNS} items={perfis} onChange={setPerfis} />
                        </div>

                        <div style={{fontWeight: 700, fontSize: 16, margin: '8px 0'}}>Permissão Tiporelatorio</div>

                        {!flTodosTabela && (
                            <div style={panelStyle}>
                                <div style={{fontWeight: 700, marginBottom: 8}}>Tabela</div>
                                <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8}}>
                                    <div style={{flex: 1}}>
                                        <AutoCompleteItem label="Tabela" path={TABELA_SOURCE} value={addTabela} onChange={setAddTabela} />
                                    </div>
                                    <button type="button" className="btnblue" style={{alignSelf: 'flex-end'}} onClick={() => {
                                        if (addTabela && !tabelas.find((t) => t.id === addTabela.id)) setTabelas([...tabelas, {id: addTabela.id, nome: addTabela.label}]);
                                        setAddTabela(null);
                                    }}>+</button>
                                </div>
                                <ItemList items={tabelas} onRemove={(id) => setTabelas(tabelas.filter((t) => t.id !== id))} />
                            </div>
                        )}

                        {!flTodosGrafico && (
                            <div style={panelStyle}>
                                <div style={{fontWeight: 700, marginBottom: 8}}>Gráfico</div>
                                <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8}}>
                                    <div style={{flex: 1}}>
                                        <AutoCompleteItem label="Gráfico" path={GRAFICO_SOURCE} value={addGrafico} onChange={setAddGrafico} />
                                    </div>
                                    <button type="button" className="btnblue" style={{alignSelf: 'flex-end'}} onClick={() => {
                                        if (addGrafico && !graficos.find((g) => g.id === addGrafico.id)) setGraficos([...graficos, {id: addGrafico.id, nome: addGrafico.label}]);
                                        setAddGrafico(null);
                                    }}>+</button>
                                </div>
                                <ItemList items={graficos} onRemove={(id) => setGraficos(graficos.filter((g) => g.id !== id))} />
                            </div>
                        )}

                        {!flTodosMapa && (
                            <div style={panelStyle}>
                                <div style={{fontWeight: 700, marginBottom: 8}}>Mapa</div>
                                <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8}}>
                                    <div style={{flex: 1}}>
                                        <AutoCompleteItem label="Mapa" path={MAPA_SOURCE} value={addMapa} onChange={setAddMapa} />
                                    </div>
                                    <button type="button" className="btnblue" style={{alignSelf: 'flex-end'}} onClick={() => {
                                        if (addMapa && !mapas.find((m) => m.id === addMapa.id)) setMapas([...mapas, {id: addMapa.id, nome: addMapa.label}]);
                                        setAddMapa(null);
                                    }}>+</button>
                                </div>
                                <ItemList items={mapas} onRemove={(id) => setMapas(mapas.filter((m) => m.id !== id))} />
                            </div>
                        )}

                        {!flTodosOrganograma && (
                            <div style={panelStyle}>
                                <div style={{fontWeight: 700, marginBottom: 8}}>Organograma</div>
                                <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8}}>
                                    <div style={{flex: 1}}>
                                        <AutoCompleteItem label="Organograma" path={'/api/relatorios/organograma'} value={addOrganograma} onChange={setAddOrganograma} />
                                    </div>
                                    <button type="button" className="btnblue" style={{alignSelf: 'flex-end'}} onClick={() => {
                                        if (addOrganograma && !organogramas.find((o) => o.id === addOrganograma.id)) setOrganogramas([...organogramas, {id: addOrganograma.id, nome: addOrganograma.label}]);
                                        setAddOrganograma(null);
                                    }}>+</button>
                                </div>
                                <ItemList items={organogramas} onRemove={(id) => setOrganogramas(organogramas.filter((o) => o.id !== id))} />
                            </div>
                        )}

                        <div style={panelStyle}>
                            <div style={{fontWeight: 700, marginBottom: 8}}>Informações</div>
                            <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8}}>
                                <input style={inputStyle} value={novaInformacao} onChange={(e) => setNovaInformacao(e.target.value)} placeholder="Inserir informação" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInformacao(); } }} />
                                <button type="button" className="btnblue" onClick={addInformacao}>+</button>
                            </div>
                            <ul style={{margin: 0, paddingLeft: 20}}>
                                {informacoes.map((info, i) => (
                                    <li key={`${info}-${i}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0'}}>
                                        <span>{info}</span>
                                        <button type="button" className="btnred" onClick={() => setInformacoes(informacoes.filter((x) => x !== info))}>remover</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb'}}>
                    <button type="button" className="btn-form-back" onClick={() => navigate('/view/filtros/listFiltros')} disabled={saving}>Cancelar</button>
                    <button type="button" className="btn-form-save" onClick={handleSave} disabled={saving || loading}>{saving ? 'Salvando...' : 'Salvar'}</button>
                </div>
            </main>
        </PermissionGate>
    );
}
