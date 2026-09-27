import {Fragment, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate, usePermissions} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';
import {useModulePaged} from '../../../shared/hooks/useModulePaged';
import type {ApiItem} from '../../../shared/types/types';
import {
    DIAS_SEMANA,
    FORMATO_LABELS,
    INDICADOR_LIST_SOURCE,
    META_DIAS_DINAMICA_SOURCE,
    META_DINAMICA_LIST_SOURCE,
    META_SEMANA_SOURCE,
    bool,
    fetchMetaValores,
    formatDate,
    formatValor,
    mesLabel,
    num,
    rec,
    str,
} from '../meta/metaDinamica';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface DetalheMeta {
    metaId: number;
    valores: Record<string, unknown>[];
    semanas: Record<string, unknown>[];
    dias: Record<string, unknown>[];
}

const useDetalheMeta = (metaId: number, aberto: boolean) => {
    const [detalhe, setDetalhe] = useState<DetalheMeta | null>(null);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (!aberto || detalhe) return;
        let ativo = true;
        (async () => {
            setCarregando(true);
            try {
                const [valores, {data: semanas}, {data: dias}] = await Promise.all([
                    fetchMetaValores(metaId),
                    api.get<Record<string, unknown>[]>(META_SEMANA_SOURCE),
                    api.get<Record<string, unknown>[]>(META_DIAS_DINAMICA_SOURCE),
                ]);
                if (!ativo) return;
                setDetalhe({
                    metaId,
                    valores,
                    semanas: (semanas ?? []).filter((row) => num(rec(row).id_meta_dinamica) === metaId),
                    dias: (dias ?? []).filter((row) => num(rec(row).id_meta_dinamica) === metaId),
                });
            } catch (e) {
                console.error('Erro ao carregar detalhe da meta dinâmica:', e);
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => { ativo = false; };
    }, [aberto, metaId, detalhe]);

    return {detalhe, carregando};
};

function TabelaDetalheMeta({titulo, colunas, children}: {
    titulo: string;
    colunas: string[];
    children: React.ReactNode;
}) {
    return (
        <div>
            <span className="sub-column-label">{titulo}</span>
            <table className="lote-table">
                <thead>
                <tr>{colunas.map((coluna) => <th key={coluna}>{coluna}</th>)}</tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

function DetalheDaMeta({metaId, aberto}: { metaId: number; aberto: boolean }) {
    const {detalhe, carregando} = useDetalheMeta(metaId, aberto);
    if (!aberto) return null;
    if (carregando) return <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Carregando...</p>;
    if (!detalhe) return null;

    return (
        <div className="sub-columns">
            <TabelaDetalheMeta titulo="Metas" colunas={['Meta', 'Valor', 'Formato']}>
                {detalhe.valores.length === 0 ? (
                    <tr><td colSpan={3}>Nenhum registro encontrado.</td></tr>
                ) : detalhe.valores.map((valor) => {
                    const formato = str(rec(valor).formato);
                    return (
                        <tr key={str(rec(valor).id)}>
                            <td>{str(rec(valor).indicadorMeta_descricao)}</td>
                            <td>{formatValor(valor.valor, formato)}</td>
                            <td>{FORMATO_LABELS[formato] ?? formato}</td>
                        </tr>
                    );
                })}
            </TabelaDetalheMeta>

            <TabelaDetalheMeta titulo="Metas semana" colunas={['Meta', 'Semana', 'Percentual', 'Valor']}>
                {detalhe.semanas.length === 0 ? (
                    <tr><td colSpan={4}>Nenhum registro encontrado.</td></tr>
                ) : detalhe.semanas.map((semana) => {
                    const percentual = num(rec(semana).percentualSemana);
                    return (
                        <tr key={str(rec(semana).id)}>
                            <td>{str(rec(semana).indicadorMeta_descricao)}</td>
                            <td>{str(rec(semana).semana)}ª semana</td>
                            <td>{percentual === null ? '' : `${percentual.toFixed(2).replace('.', ',')}%`}</td>
                            <td>{formatValor(rec(semana).valorSemana, 'R')}</td>
                        </tr>
                    );
                })}
            </TabelaDetalheMeta>

            <TabelaDetalheMeta titulo="Metas dia" colunas={['Semana', 'Dia', 'Data', 'Meta', 'Valor', 'Formato']}>
                {detalhe.dias.length === 0 ? (
                    <tr><td colSpan={6}>Nenhum registro encontrado.</td></tr>
                ) : detalhe.dias.map((dia) => {
                    const formato = str(rec(dia).formato);
                    const diaNum = num(rec(dia).dia);
                    return (
                        <tr key={str(rec(dia).id)}>
                            <td>{str(rec(dia).semana)}ª semana</td>
                            <td>{DIAS_SEMANA[diaNum ?? 0] ?? ''}</td>
                            <td>{formatDate(rec(dia).data)}</td>
                            <td>{str(rec(dia).indicadorMeta_descricao)}</td>
                            <td>{formatValor(dia.valor, formato)}</td>
                            <td>{FORMATO_LABELS[formato] ?? formato}</td>
                        </tr>
                    );
                })}
            </TabelaDetalheMeta>
        </div>
    );
}

function MetasDoIndicador({indicadorId, aberto}: { indicadorId: number; aberto: boolean }) {
    const [metas, setMetas] = useState<Record<string, unknown>[]>([]);
    const [expandidas, setExpandidas] = useState<Record<string, boolean>>({});
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (!aberto) return;
        let ativo = true;
        (async () => {
            setCarregando(true);
            try {
                const {data} = await api.get<Record<string, unknown>[]>(META_DINAMICA_LIST_SOURCE);
                if (!ativo) return;
                setMetas((data ?? []).filter((row) => num(rec(row).id_indicador) === indicadorId));
            } catch (e) {
                console.error('Erro ao carregar metas do indicador:', e);
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => { ativo = false; };
    }, [aberto, indicadorId]);

    if (!aberto) return null;
    if (carregando) return <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Carregando metas...</p>;
    if (metas.length === 0) {
        return <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Nenhum registro encontrado.</p>;
    }

    return (
        <table className="lote-table">
            <thead>
            <tr>
                <th style={{width: 40}}/>
                <th style={{width: '10%', textAlign: 'center'}}>ID</th>
                <th style={{width: '30%'}}>Indicador</th>
                <th style={{width: '30%'}}>Unidade</th>
                <th style={{width: '10%', textAlign: 'center'}}>Ano</th>
                <th style={{width: '10%', textAlign: 'center'}}>Mês</th>
            </tr>
            </thead>
            <tbody>
            {metas.map((meta) => {
                const row = rec(meta);
                const chave = str(row.id);
                const metaId = num(row.id) ?? 0;
                const metaAberta = Boolean(expandidas[chave]);
                return (
                    <Fragment key={chave}>
                        <tr>
                            <td style={{textAlign: 'center'}}>
                                <button
                                    type="button"
                                    className="btn-row-toggle"
                                    title={metaAberta ? 'Recolher' : 'Expandir'}
                                    onClick={() => setExpandidas((prev) => ({...prev, [chave]: !prev[chave]}))}
                                >
                                    {metaAberta ? '▾' : '▸'}
                                </button>
                            </td>
                            <td style={{textAlign: 'center'}}>{chave}</td>
                            <td>{str(row.indicador_nome)}</td>
                            <td>{str(row.unidade_sucinto)}</td>
                            <td style={{textAlign: 'center'}}>{str(row.ano)}</td>
                            <td style={{textAlign: 'center'}}>{mesLabel(row.mes)}</td>
                        </tr>
                        {metaAberta && (
                            <tr className="row-detail">
                                <td colSpan={7}>
                                    <DetalheDaMeta metaId={metaId} aberto={metaAberta}/>
                                </td>
                            </tr>
                        )}
                    </Fragment>
                );
            })}
            </tbody>
        </table>
    );
}

const asRecord = (item: ApiItem) => rec(item);

export default function ViewIndicadorListIndicadorListScreen() {
    const navigate = useNavigate();
    const {can} = usePermissions();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [busca, setBusca] = useState('');
    const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

    const q = useModulePaged(INDICADOR_LIST_SOURCE, page, size);
    const items = useMemo(() => (q.data?.content ?? []) as ApiItem[], [q.data]);
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);
    const totalElements = q.data?.totalElements ?? 0;

    const filtrados = useMemo(() => {
        const term = busca.trim().toLowerCase();
        if (!term) return items;
        return items.filter((item) => str(asRecord(item).nome).toLowerCase().includes(term));
    }, [items, busca]);

    const alternar = (chave: string) => setExpandidos((prev) => ({...prev, [chave]: !prev[chave]}));

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group">
                                <span className="breadcrumb-item breadcrumb-current">Indicador</span>
                            </div>
                        </nav>
                    </div>
                    <div className="page-header-actions">
                        {can('CREATE') && (
                            <button
                                type="button"
                                className="btnblue"
                                onClick={() => navigate('/view/indicador/formIndicador')}
                            >
                                Novo indicador
                            </button>
                        )}
                    </div>
                </div>

                <div className="div_form" style={{margin: 15}}>
                    <div className="data-table-toolbar" style={{marginBottom: 12}}>
                        <input
                            className="form-input"
                            style={{maxWidth: 320}}
                            placeholder="Buscar por nome..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                        <button type="button" className="btnyellow" onClick={() => setBusca('')}>Limpar</button>
                    </div>

                    <table className="lote-table">
                        <thead>
                        <tr>
                            <th style={{width: 40}}/>
                            <th style={{width: '8%', textAlign: 'center'}}>ID</th>
                            <th style={{width: '32%'}}>Nome</th>
                            <th style={{width: '12%', textAlign: 'center'}}>Data Criação</th>
                            <th style={{width: '8%', textAlign: 'center'}}>Ano</th>
                            <th style={{width: '8%', textAlign: 'center'}}>Mês</th>
                            <th style={{width: '8%', textAlign: 'center'}}>Semana</th>
                            <th style={{width: '8%', textAlign: 'center'}}>Dia</th>
                            <th style={{width: 120, textAlign: 'center'}}>Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {q.isLoading && items.length === 0 ? (
                            <tr><td colSpan={9}>Carregando...</td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr><td colSpan={9}>Nenhum registro encontrado.</td></tr>
                        ) : (
                            filtrados.map((item) => {
                                const row = asRecord(item);
                                const chave = str(row.id);
                                const indicadorId = num(row.id) ?? 0;
                                const aberto = Boolean(expandidos[chave]);
                                return (
                                    <Fragment key={chave}>
                                        <tr>
                                            <td style={{textAlign: 'center'}}>
                                                <button
                                                    type="button"
                                                    className="btn-row-toggle"
                                                    title={aberto ? 'Recolher' : 'Expandir'}
                                                    onClick={() => alternar(chave)}
                                                >
                                                    {aberto ? '▾' : '▸'}
                                                </button>
                                            </td>
                                            <td style={{textAlign: 'center'}}>{chave}</td>
                                            <td>{str(row.nome)}</td>
                                            <td style={{textAlign: 'center'}}>{formatDate(row.data_criacao)}</td>
                                            <td style={{textAlign: 'center'}}>{bool(row.fl_ano) ? 'Sim' : 'Não'}</td>
                                            <td style={{textAlign: 'center'}}>{bool(row.fl_mes) ? 'Sim' : 'Não'}</td>
                                            <td style={{textAlign: 'center'}}>{bool(row.fl_semana) ? 'Sim' : 'Não'}</td>
                                            <td style={{textAlign: 'center'}}>{bool(row.fl_dia) ? 'Sim' : 'Não'}</td>
                                            <td style={{textAlign: 'center', whiteSpace: 'nowrap'}}>
                                                {can('UPDATE') && (
                                                    <button
                                                        type="button"
                                                        className="btngreen"
                                                        title="Alterar"
                                                        onClick={() => navigate(`/view/indicador/formIndicador?id=${chave}`)}
                                                    >
                                                        Alterar
                                                    </button>
                                                )}
                                                {can('UPDATE') && (
                                                    <button
                                                        type="button"
                                                        className="btnblue"
                                                        title="Metas"
                                                        onClick={() =>
                                                            navigate(`/view/meta/formMetaDinamica?indicadorId=${chave}`)}
                                                    >
                                                        Metas
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {aberto && (
                                            <tr className="row-detail">
                                                <td colSpan={9}>
                                                    <MetasDoIndicador indicadorId={indicadorId} aberto={aberto}/>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })
                        )}
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan={9} className="data-table-paginator">
                                <button
                                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                                    disabled={page === 0 || q.isFetching}
                                >
                                    Anterior
                                </button>
                                <span>Página {page + 1} de {totalPages}</span>
                                <button
                                    onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                    disabled={page >= totalPages - 1 || q.isFetching}
                                >
                                    Próxima
                                </button>
                                <label>
                                    Registros por página
                                    <select
                                        value={size}
                                        onChange={(e) => {
                                            setSize(Number(e.target.value));
                                            setPage(0);
                                        }}
                                    >
                                        {PAGE_SIZE_OPTIONS.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </label>
                                <span>Total: {totalElements}</span>
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </main>
        </PermissionGate>
    );
}
