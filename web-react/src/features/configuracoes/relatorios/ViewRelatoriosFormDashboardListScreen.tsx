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
    ESTRUTURA_SOURCE,
    ESTRUTURA_COLUMNS,
    ESTRUTURA_SEARCH,
    TABELA_SOURCE,
    TABELA_COLUMNS,
    TABELA_SEARCH,
    GRAFICO_SOURCE,
    GRAFICO_COLUMNS,
    GRAFICO_SEARCH,
    MAPA_SOURCE,
    MAPA_COLUMNS,
    MAPA_SEARCH,
} from '../../../shared/services/masterDetailSources';
import type {ApiItem} from '../../../shared/types/types.ts';
import {useApi, api} from '../../../shared/services/api';
import {API_PATHS} from '../../../shared/services/apiPaths';

interface PainelTopico {
    id?: number;
    painelId?: number;
    tabelaId?: number;
    graficoId?: number;
    mapaId?: number;
    ordem?: number;
}

interface DashboardEntity {
    id?: number;
    nome?: string;
}

const requiredMark = <span style={{color: '#C90000', marginLeft: 4}}>*</span>;

const optionLabel = (item: any, fallbackKeys: string[] = ['nomeVisualizacao', 'nome']) => {
    for (const key of fallbackKeys) {
        const value = item?.[key];
        if (typeof value === 'string' && value) return value;
    }
    return `#${String(item?.id ?? '')}`;
};

export default function ViewRelatoriosFormDashboardListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    const [entity, setEntity] = useState<DashboardEntity>({});
    const [topicos, setTopicos] = useState<PainelTopico[]>([]);

    const [tabelas, setTabelas] = useState<any[]>([]);
    const [graficos, setGraficos] = useState<any[]>([]);
    const [mapas, setMapas] = useState<any[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);

    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);

    const [filtrosSelecionados, setFiltrosSelecionados] = useState<Set<number>>(new Set());
    const [permissaoSub, setPermissaoSub] = useState<'usuarios' | 'unidades' | 'perfis'>('usuarios');

    const [adicionarTipo, setAdicionarTipo] = useState<'tabela' | 'grafico' | 'mapa'>('tabela');
    const [adicionarId, setAdicionarId] = useState('');

    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const {post: savePainel} = useApi(API_PATHS.relatorios.painel);
    const {put: updatePainel} = useApi(API_PATHS.relatorios.painel);
    const {post: saveTopico} = useApi(API_PATHS.relatorios.painelPainel);
    const {put: updateTopico} = useApi(API_PATHS.relatorios.painelPainel);
    const {delete: deleteTopico} = useApi(API_PATHS.relatorios.painelPainel);

    useEffect(() => {
        (async () => {
            try {
                const {data} = await api.get<any[]>(TABELA_SOURCE);
                if (Array.isArray(data)) setTabelas(data);
            } catch (error) {
                console.error('Erro ao carregar tabelas:', error);
            }
            try {
                const {data} = await api.get<any[]>(GRAFICO_SOURCE);
                if (Array.isArray(data)) setGraficos(data);
            } catch (error) {
                console.error('Erro ao carregar gráficos:', error);
            }
            try {
                const {data} = await api.get<any[]>(MAPA_SOURCE);
                if (Array.isArray(data)) setMapas(data);
            } catch (error) {
                console.error('Erro ao carregar mapas:', error);
            }
            try {
                const {data} = await api.get<any[]>(API_PATHS.relatorios.filtro);
                if (Array.isArray(data)) setFiltros(data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            }
        })();
    }, []);

    useEffect(() => {
        if (editingId) {
            (async () => {
                try {
                    const painel: any = (await api.get(`${API_PATHS.relatorios.painel}/${editingId}`)).data;
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
                }
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const resolveItems = async (source: string, ids: any[]): Promise<ApiItem[]> => {
        if (!Array.isArray(ids) || ids.length === 0) return [];
        const {data} = await api.get<ApiItem[]>(source);
        const all = Array.isArray(data) ? data : [];
        const set = new Set(ids.map((x: any) => String(x.id ?? x)));
        return all.filter((item) => set.has(String((item as any).id)));
    };

    const garantirPainel = async (): Promise<number> => {
        if (entity.id) return entity.id;
        if (!entity.nome || entity.nome.trim().length < 3) {
            throw new Error('Informe o nome do dashboard (mínimo 3 caracteres) antes de adicionar itens.');
        }
        const novo = await savePainel({nome: entity.nome.trim()});
        setEntity((prev) => ({...prev, id: novo.id}));
        return novo.id;
    };

    const nomeDeTopico = (t: PainelTopico, tipo: string): string => {
        const id = tipo === 'tabela' ? t.tabelaId : tipo === 'grafico' ? t.graficoId : t.mapaId;
        const list = tipo === 'tabela' ? tabelas : tipo === 'grafico' ? graficos : mapas;
        return id ? optionLabel(list.find((item) => item.id === id) ?? {id}) : '';
    };

    const tipoDeTopico = (t: PainelTopico): 'tabela' | 'grafico' | 'mapa' =>
        t.tabelaId ? 'tabela' : t.graficoId ? 'grafico' : t.mapaId ? 'mapa' : 'tabela';

    const addTopico = async () => {
        if (!adicionarId) {
            alert('Selecione um item para adicionar');
            return;
        }
        try {
            const painelId = await garantirPainel();
            const numero = Number(adicionarId);
            const body: any = {painelId, ordem: topicos.length + 1};
            if (adicionarTipo === 'tabela') body.tabelaId = numero;
            else if (adicionarTipo === 'grafico') body.graficoId = numero;
            else body.mapaId = numero;

            const novo = await saveTopico(body);
            setTopicos((prev) => [...prev, {
                id: novo.id,
                painelId: novo.painelId,
                tabelaId: novo.tabelaId,
                graficoId: novo.graficoId,
                mapaId: novo.mapaId,
                ordem: novo.ordem,
            }]);
            setAdicionarId('');
        } catch (err: any) {
            console.error('Erro ao adicionar item:', err);
            alert(err?.message ?? 'Erro ao adicionar item');
        }
    };

    const removerTopico = async (topico: PainelTopico) => {
        if (!topico.id) return;
        try {
            await deleteTopico(topico.id);
            setTopicos((prev) => prev.filter((t) => t.id !== topico.id));
        } catch (err) {
            console.error('Erro ao remover item:', err);
            alert('Erro ao remover item');
        }
    };

    const moverTopico = async (index: number, direcao: -1 | 1) => {
        const alvo = index + direcao;
        if (alvo < 0 || alvo >= topicos.length) return;
        const atual = topicos[index];
        const outro = topicos[alvo];
        try {
            const novoAtual = {...atual, ordem: outro.ordem};
            const novoOutro = {...outro, ordem: atual.ordem};
            if (novoAtual.id) await updateTopico(novoAtual.id, {painelId: novoAtual.painelId, tabelaId: novoAtual.tabelaId, graficoId: novoAtual.graficoId, mapaId: novoAtual.mapaId, ordem: novoOutro.ordem});
            if (novoOutro.id) await updateTopico(novoOutro.id, {painelId: novoOutro.painelId, tabelaId: novoOutro.tabelaId, graficoId: novoOutro.graficoId, mapaId: novoOutro.mapaId, ordem: novoAtual.ordem});
            const lista = [...topicos];
            lista[index] = novoOutro;
            lista[alvo] = novoAtual;
            setTopicos(lista);
        } catch (err) {
            console.error('Erro ao reordenar item:', err);
            alert('Erro ao reordenar item');
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

    const salvar = async () => {
        setError(undefined);
        if (!entity.nome || entity.nome.trim().length < 3) {
            setError('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        setSalvando(true);
        try {
            const id = editingId
                ? (await updatePainel(editingId, {nome: entity.nome.trim()}), editingId)
                : (entity.id ?? (await garantirPainel()));

            const payloadPermissao = {
                usuariosIds: usuarios.map((u) => Number((u as any).id)),
                unidadesIds: unidades.map((u) => Number((u as any).id)),
                perfisIds: perfis.map((p) => Number((p as any).id)),
            };
            await api.put(`${API_PATHS.relatorios.painel}/${id}/permissoes`, payloadPermissao);

            await api.put(`${API_PATHS.relatorios.painel}/${id}/filtros`, {
                filtrosIds: Array.from(filtrosSelecionados),
            });

            alert('Dashboard salvo com sucesso!');
            navigate('/view/relatorios/listDashboard');
        } catch (err) {
            console.error('Erro ao salvar dashboard:', err);
            setError('Erro ao salvar dashboard');
        } finally {
            setSalvando(false);
        }
    };

    const voltar = () => navigate('/view/relatorios/listDashboard');

    const topicoRows = topicos.map((t) => {
        const tipo = tipoDeTopico(t);
        return {...t, relatorioNome: nomeDeTopico(t, tipo), tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1)};
    });

    const topicoActions: DataTableRowAction[] = [
        {key: 'up', title: 'Subir', icon: <i className="fa fa-arrow-up" />, className: 'btnblack', onClick: (item: any) => moverTopico(topicos.findIndex((t) => t.id === item.id), -1)},
        {key: 'down', title: 'Descer', icon: <i className="fa fa-arrow-down" />, className: 'btnbrown', onClick: (item: any) => moverTopico(topicos.findIndex((t) => t.id === item.id), 1)},
        {key: 'remove', title: 'Remover', icon: <i className="fa fa-minus" />, className: 'btnred', onClick: removerTopico},
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
                    onChange={(e) => setEntity({...entity, nome: e.target.value})}
                    placeholder="Nome do dashboard"
                />
            </label>

            <div className="form-section-title" style={{gridColumn: '1 / -1'}}>Painéis do Dashboard</div>

            <label className="form-field">
                <span className="form-label">Tipo de item</span>
                <select
                    className="form-input form-select"
                    value={adicionarTipo}
                    onChange={(e) => {setAdicionarTipo(e.target.value as 'tabela' | 'grafico' | 'mapa'); setAdicionarId('');}}
                >
                    <option value="tabela">Tabela</option>
                    <option value="grafico">Gráfico</option>
                    <option value="mapa">Mapa</option>
                </select>
            </label>
            <label className="form-field">
                <span className="form-label">Relatório</span>
                <select
                    className="form-input form-select"
                    value={adicionarId}
                    onChange={(e) => setAdicionarId(e.target.value)}
                >
                    <option value="">-- Selecione --</option>
                    {(adicionarTipo === 'tabela' ? tabelas : adicionarTipo === 'grafico' ? graficos : mapas).map((item) => (
                        <option key={item.id} value={String(item.id)}>{optionLabel(item)}</option>
                    ))}
                </select>
            </label>
            <div className="form-field" style={{gridColumn: '1 / -1'}}>
                <button type="button" className="btnblue" onClick={() => void addTopico()} disabled={!adicionarId}>
                    ＋ Adicionar Item
                </button>
            </div>

            <div style={{gridColumn: '1 / -1'}}>
                <DataTable
                    data={topicoRows as unknown as ApiItem[]}
                    columns={[
                        {key: 'relatorioNome', label: 'Relatório'},
                        {key: 'tipo', label: 'Tipo'},
                        {key: 'ordem', label: 'Ordem'},
                    ]}
                    extraRowActions={topicoActions}
                    hideCreate
                    hideUpdate
                    hideDelete
                    hideView
                />
            </div>
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
                <div className="form-section-title" style={{marginBottom: 8}}>Filtros vinculados ao dashboard</div>
                <p style={{margin: '0 0 8px', fontSize: 13, color: '#555'}}>
                    Cada filtro existe de forma independente (menu de filtros). Marque abaixo os filtros que este dashboard deve exibir.
                </p>
                {filtros.length === 0 ? (
                    <p style={{margin: 0, fontSize: 13, color: '#888'}}>Nenhum filtro cadastrado.</p>
                ) : (
                    <div className="form-grid">
                        {filtros.map((filtro: any) => {
                            const checked = filtrosSelecionados.has(Number(filtro.id));
                            return (
                                <label key={filtro.id} className="form-field" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleFiltro(Number(filtro.id))}
                                    />
                                    <span style={{fontSize: 13}}>{filtro.nome ?? `#${filtro.id}`}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>
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
                                    Relatório de Dashboard — {editingId ? 'Edição' : 'Cadastro'}
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