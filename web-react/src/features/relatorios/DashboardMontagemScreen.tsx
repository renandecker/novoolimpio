import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {listarRelatoriosDisponiveis, type RelatorioDisponivel} from './relatorios';
import {listarIndicadoresGauge, type IndicadorGauge} from './indicadorGauge';
import {
    DASHBOARD_LAYOUTS,
    TILE_TIPOS,
    carregarMontagem,
    excluirMontagem,
    listarMontagens,
    novaMontagemId,
    salvarMontagem,
    tileTipoIcone,
    tileTipoLabel,
    tileViewHref,
    tilesForLayout,
    type DashboardLayoutId,
    type DashboardMontagem,
    type DashboardTile,
    type DashboardTileTipo,
} from './dashboardMontagem';
import './DashboardMontagem.css';

const GRAFICO_TIPOS = new Set(['GRAFICO', 'PIZZA', 'LINHA', 'COMBINADO', 'CIRCULAR', 'BARRA_VERTICAL', 'BARRA_HORIZONTAL']);

type OpcaoRelatorio = { id: number; nome: string; tipo: string };

export default function DashboardMontagemScreen() {
    const {id} = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [nome, setNome] = useState('');
    const [layoutId, setLayoutId] = useState<DashboardLayoutId>('grade-2x2');
    const [tiles, setTiles] = useState<DashboardTile[]>(() => tilesForLayout('grade-2x2'));
    const [montagens, setMontagens] = useState<DashboardMontagem[]>([]);
    const [pickerSlot, setPickerSlot] = useState<number | null>(null);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        setMontagens(listarMontagens());
        if (id) {
            const atual = carregarMontagem(id);
            if (atual) {
                setNome(atual.nome);
                setLayoutId(atual.layoutId);
                setTiles(tilesForLayout(atual.layoutId, atual.tiles));
            }
        }
    }, [id]);

    const layout = useMemo(
        () => DASHBOARD_LAYOUTS.find((l) => l.id === layoutId) ?? DASHBOARD_LAYOUTS[0],
        [layoutId],
    );

    const trocarLayout = (next: DashboardLayoutId) => {
        setLayoutId(next);
        setTiles((prev) => tilesForLayout(next, prev));
    };

    const atualizarTile = (index: number, patch: Partial<DashboardTile>) =>
        setTiles((prev) => prev.map((t, i) => (i === index ? {...t, ...patch} : t)));

    const limparTile = (index: number) =>
        setTiles((prev) => prev.map((t, i) =>
            i === index ? {...t, tipo: null, relatorioId: null, relatorioNome: null, titulo: ''} : t,
        ));

    const handleSalvar = () => {
        if (nome.trim().length < 3) {
            alert('Informe o nome do dashboard (mínimo 3 caracteres).');
            return;
        }
        if (!tiles.some((t) => t.tipo && t.relatorioId)) {
            alert('Preencha pelo menos um quadrinho com tipo de relatório e indicador.');
            return;
        }
        setSalvando(true);
        try {
            const montagem: DashboardMontagem = {
                id: id ?? novaMontagemId(),
                nome: nome.trim(),
                layoutId,
                tiles,
                updatedAt: new Date().toISOString(),
            };
            salvarMontagem(montagem);
            setMontagens(listarMontagens());
            alert('Dashboard salvo com sucesso!');
            navigate('/view/relatorios/listDashboard');
        } finally {
            setSalvando(false);
        }
    };

    const handleExcluir = () => {
        if (!id) return;
        if (!confirm(`Excluir o dashboard "${nome}"?`)) return;
        excluirMontagem(id);
        navigate('/view/relatorios/listDashboard');
    };

    return (
        <PermissionGate permission="READ">
            <main className="dash-mont">
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group">
                                <span className="breadcrumb-item breadcrumb-current">
                                    Dashboard — {isEditing ? 'Edição' : 'Cadastro'}
                                </span>
                            </div>
                        </nav>
                    </div>
                </div>
                <div className="dash-mont-header">
                    <div>
                        <h1>{isEditing ? 'Editar dashboard' : 'Novo dashboard'}</h1>
                        <p>Defina o nome, escolha um template de layout e preencha cada quadrinho com tabelas, gráficos, mapas, organogramas ou indicadores gauge.</p>
                    </div>
                    <div className="dash-mont-header-actions">
                        <Link className="btnyellow" to="/view/relatorios/listDashboard">Voltar</Link>
                        {isEditing && (
                            <button type="button" className="btnred" onClick={handleExcluir}>Excluir</button>
                        )}
                        <button type="button" className="btnblue" disabled={salvando} onClick={handleSalvar}>
                            {salvando ? 'Salvando...' : 'Salvar dashboard'}
                        </button>
                    </div>
                </div>

                <section className="dash-mont-card">
                    <h2>1 · Nome do dashboard</h2>
                    <label className="dash-mont-field">
                        <span>Nome *</span>
                        <input
                            type="text"
                            value={nome}
                            maxLength={120}
                            placeholder="Ex: Comercial — Visão executiva"
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </label>
                </section>

                <section className="dash-mont-card">
                    <h2>2 · Template de layout</h2>
                    <p className="dash-mont-hint">Trocar o template mantém o que já foi preenchido nos quadrinhos.</p>
                    <div className="dash-mont-templates">
                        {DASHBOARD_LAYOUTS.map((l) => (
                            <button
                                key={l.id}
                                type="button"
                                className={`dash-mont-template ${l.id === layoutId ? 'active' : ''}`}
                                onClick={() => trocarLayout(l.id)}
                                aria-pressed={l.id === layoutId}
                            >
                                <span className={`dash-mont-mini ${l.gradeClass}`}>
                                    {Array.from({length: l.slots}).map((_, i) => (
                                        <i key={i} style={{gridColumn: l.spans[i]?.col, gridRow: l.spans[i]?.row}}/>
                                    ))}
                                </span>
                                <strong>{l.nome}</strong>
                                <small>{l.descricao}</small>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="dash-mont-card">
                    <h2>3 · Quadrinhos do layout — {layout.nome}</h2>
                    <div className={`dash-mont-grade ${layout.gradeClass}`}>
                        {tiles.map((tile, index) => {
                            const href = tileViewHref(tile);
                            return (
                                <div
                                    key={tile.id}
                                    className="dash-mont-tile"
                                    style={{gridColumn: layout.spans[index]?.col, gridRow: layout.spans[index]?.row}}
                                >
                                    <div className="dash-mont-tile-head">
                                        <span className="dash-mont-slot">#{index + 1}</span>
                                        <span className="dash-mont-tipo">
                                            {tileTipoIcone(tile.tipo)} {tileTipoLabel(tile.tipo)}
                                        </span>
                                    </div>
                                    <label className="dash-mont-field">
                                        <span>Tipo de relatório</span>
                                        <select
                                            value={tile.tipo ?? ''}
                                            onChange={(e) => {
                                                const next = (e.target.value || null) as DashboardTileTipo | null;
                                                atualizarTile(index, {tipo: next, relatorioId: null, relatorioNome: null});
                                            }}
                                        >
                                            <option value="">Selecionar...</option>
                                            {TILE_TIPOS.map((t) => (
                                                <option key={t.value} value={t.value}>{t.icone} {t.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <div className="dash-mont-report">
                                        {tile.relatorioNome ? (
                                            <strong title={tile.relatorioNome}>{tile.relatorioNome}</strong>
                                        ) : (
                                            <span className="dash-mont-empty">Nenhum indicador escolhido</span>
                                        )}
                                        <button
                                            type="button"
                                            className="btnblack"
                                            disabled={!tile.tipo}
                                            title={!tile.tipo ? 'Escolha o tipo primeiro' : 'Escolher relatório'}
                                            onClick={() => setPickerSlot(index)}
                                        >
                                            {tile.relatorioId ? 'Trocar' : 'Escolher'}
                                        </button>
                                        {tile.relatorioId && (
                                            <button type="button" className="btnred" onClick={() => limparTile(index)}>
                                                Limpar
                                            </button>
                                        )}
                                    </div>
                                    <label className="dash-mont-field">
                                        <span>Título do quadrinho (opcional)</span>
                                        <input
                                            type="text"
                                            value={tile.titulo}
                                            maxLength={80}
                                            placeholder="Ex: Receita do mês"
                                            onChange={(e) => atualizarTile(index, {titulo: e.target.value})}
                                        />
                                    </label>
                                    {href && (
                                        <a className="dash-mont-view" href={href} target="_blank" rel="noreferrer">
                                            Visualizar relatório ↗
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="dash-mont-card">
                    <h2>Montagens salvas neste navegador</h2>
                    {montagens.length === 0 ? (
                        <p className="dash-mont-hint">Nenhuma montagem salva ainda.</p>
                    ) : (
                        <ul className="dash-mont-saved">
                            {montagens.map((m) => (
                                <li key={m.id}>
                                    <div>
                                        <strong>{m.nome}</strong>
                                        <small>
                                            {DASHBOARD_LAYOUTS.find((l) => l.id === m.layoutId)?.nome} ·{' '}
                                            {m.tiles.filter((t) => t.relatorioId).length}/{m.tiles.length} quadrinhos
                                        </small>
                                    </div>
                                    <div className="dash-mont-saved-actions">
                                        <Link className="btnblack" to={`/view/relatorios/dashboardMontagem/${m.id}`}>
                                            Editar
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {pickerSlot !== null && tiles[pickerSlot] && (
                    <RelatorioPickerModal
                        tipo={tiles[pickerSlot].tipo}
                        onClose={() => setPickerSlot(null)}
                        onSelect={(opcao) => {
                            atualizarTile(pickerSlot, {relatorioId: opcao.id, relatorioNome: opcao.nome});
                            setPickerSlot(null);
                        }}
                    />
                )}
            </main>
        </PermissionGate>
    );
}

function RelatorioPickerModal({
    tipo,
    onClose,
    onSelect,
}: {
    tipo: DashboardTileTipo | null;
    onClose: () => void;
    onSelect: (opcao: OpcaoRelatorio) => void;
}) {
    const [busca, setBusca] = useState('');
    const [page, setPage] = useState(0);
    const [opcoes, setOpcoes] = useState<OpcaoRelatorio[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    const carregar = useCallback(async (pagina: number, termo: string) => {
        if (!tipo) return;
        setLoading(true);
        try {
            if (tipo === 'INDICADOR_GAUGE') {
                const resp = await listarIndicadoresGauge(pagina, pageSize, termo || undefined);
                setOpcoes((resp.content ?? []).map((g: IndicadorGauge) => ({id: g.id, nome: g.nome, tipo: 'INDICADOR_GAUGE'})));
                setTotal(resp.totalElements ?? 0);
            } else {
                const resp = await listarRelatoriosDisponiveis(pagina, pageSize, termo || undefined);
                const content: RelatorioDisponivel[] = resp.content ?? [];
                const filtrados = content.filter((r) => {
                    if (tipo === 'TABELA') return r.tipo === 'TABELA';
                    if (tipo === 'MAPA') return r.tipo === 'MAPA';
                    if (tipo === 'ORGANOGRAMA') return r.tipo === 'ORGANOGRAMA';
                    return GRAFICO_TIPOS.has(r.tipo);
                });
                setOpcoes(filtrados.map((r) => ({id: r.id, nome: r.nome, tipo: r.tipo})));
                setTotal(resp.totalElements ?? 0);
            }
        } catch {
            setOpcoes([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [tipo]);

    useEffect(() => {
        setPage(0);
        carregar(0, '');
    }, [tipo, carregar]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="dash-mont-overlay" onClick={onClose}>
            <div className="dash-mont-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dash-mont-modal-head">
                    <h3>Escolher {tileTipoLabel(tipo)} {tileTipoIcone(tipo)}</h3>
                    <button type="button" className="btnred" onClick={onClose}>Fechar</button>
                </div>
                <div className="dash-mont-search">
                    <input
                        type="text"
                        value={busca}
                        placeholder="Buscar por nome..."
                        onChange={(e) => setBusca(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setPage(0);
                                carregar(0, busca.trim());
                            }
                        }}
                    />
                    <button type="button" className="btnblack" onClick={() => {
                        setPage(0);
                        carregar(0, busca.trim());
                    }}>
                        Buscar
                    </button>
                </div>
                {loading ? (
                    <p className="dash-mont-hint">Carregando...</p>
                ) : opcoes.length === 0 ? (
                    <p className="dash-mont-hint">Nenhum relatório encontrado para este tipo.</p>
                ) : (
                    <ul className="dash-mont-options">
                        {opcoes.map((o) => (
                            <li key={`${o.tipo}-${o.id}`}>
                                <button type="button" onClick={() => onSelect(o)}>
                                    <strong>{o.nome}</strong>
                                    <small>#{o.id} · {o.tipo}</small>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="dash-mont-pager">
                    <button
                        type="button"
                        className="btnblack"
                        disabled={page === 0 || loading}
                        onClick={() => {
                            const next = Math.max(0, page - 1);
                            setPage(next);
                            carregar(next, busca.trim());
                        }}
                    >
                        Anterior
                    </button>
                    <span>Página {page + 1} de {totalPages}</span>
                    <button
                        type="button"
                        className="btnblack"
                        disabled={page >= totalPages - 1 || loading}
                        onClick={() => {
                            const next = Math.min(totalPages - 1, page + 1);
                            setPage(next);
                            carregar(next, busca.trim());
                        }}
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>
    );
}
