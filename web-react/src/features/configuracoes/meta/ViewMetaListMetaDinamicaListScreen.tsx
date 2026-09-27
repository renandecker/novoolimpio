import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate, usePermissions} from '../../../shared/services/permissions';
import {Tabs} from '../../../shared/components/Tabs';
import {api} from '../../../shared/services/api';
import {useModulePaged} from '../../../shared/hooks/useModulePaged';
import {MetaDinamicaEditor} from './MetaDinamicaEditor';
import {
    FORMATO_LABELS,
    META_DINAMICA_API,
    META_DINAMICA_LIST_SOURCE,
    fetchAllIndicadorMetas,
    fetchMetaValores,
    formatValor,
    mesLabel,
    num,
    rec,
    str,
} from './metaDinamica';
import type {ApiItem} from '../../../shared/types/types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function MetasDaMeta({metaId}: { metaId: number }) {
    const [metas, setMetas] = useState<Record<string, unknown>[]>([]);
    const [valores, setValores] = useState<Record<string, unknown>[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let ativo = true;
        (async () => {
            setCarregando(true);
            try {
                const [todas, valoresRows] = await Promise.all([fetchAllIndicadorMetas(), fetchMetaValores(metaId)]);
                if (!ativo) return;
                const usados = new Set(valoresRows.map((row) => num(rec(row).id_indicador_meta)));
                setMetas(todas.filter((meta) => usados.has(num(rec(meta).id) ?? -1)));
                setValores(valoresRows);
            } catch (e) {
                console.error('Erro ao carregar metas da meta dinâmica:', e);
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => { ativo = false; };
    }, [metaId]);

    if (carregando) return <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Carregando metas...</p>;
    if (valores.length === 0) {
        return <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Nenhum registro encontrado.</p>;
    }

    return (
        <table className="lote-table">
            <thead>
            <tr>
                <th style={{width: '40%'}}>Meta</th>
                <th style={{width: '30%'}}>Valor</th>
                <th style={{width: '30%'}}>Formato</th>
            </tr>
            </thead>
            <tbody>
            {valores.map((valor) => {
                const meta = metas.find((item) => num(rec(item).id) === num(rec(valor).id_indicador_meta));
                const formato = str(rec(valor).formato);
                return (
                    <tr key={str(rec(valor).id)}>
                        <td>{str(rec(valor).indicador_meta_descricao) || str(rec(meta).descricao)}</td>
                        <td>{formatValor(valor.valor, formato)}</td>
                        <td>{FORMATO_LABELS[formato] ?? formato}</td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}

function ListagemMetasDinamicas() {
    const navigate = useNavigate();
    const {can} = usePermissions();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [busca, setBusca] = useState('');
    const [expandido, setExpandido] = useState<Record<string, boolean>>({});
    const [removendo, setRemovendo] = useState<number | null>(null);

    const q = useModulePaged(META_DINAMICA_LIST_SOURCE, page, size);
    const items = useMemo(() => (q.data?.content ?? []) as ApiItem[], [q.data]);
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);

    const filtrados = useMemo(() => {
        const term = busca.trim().toLowerCase();
        if (!term) return items;
        return items.filter((item) => {
            const row = rec(item);
            return [row.indicador_nome, row.unidade_sucinto, row.ano, mesLabel(row.mes)]
                .some((value) => str(value).toLowerCase().includes(term));
        });
    }, [items, busca]);

    const remover = useCallback(async (id: number) => {
        setRemovendo(id);
        try {
            await api.delete(`${META_DINAMICA_API}/${id}`);
            q.refetch();
        } catch (e) {
            console.error('Erro ao excluir meta dinâmica:', e);
            alert('Erro ao excluir a meta dinâmica.');
        } finally {
            setRemovendo(null);
        }
    }, [q]);

    const alternarExpansao = (chave: string) => setExpandido((prev) => ({...prev, [chave]: !prev[chave]}));

    return (
        <div className="div_form" style={{margin: 15}}>
            <div className="data-table-toolbar" style={{marginBottom: 12}}>
                <input
                    className="form-input"
                    style={{maxWidth: 320}}
                    placeholder="Buscar por indicador, unidade, ano ou mês..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <button type="button" className="btnyellow" onClick={() => setBusca('')}>Limpar</button>
            </div>

            <table className="lote-table">
                <thead>
                <tr>
                    <th style={{width: 40}}/>
                    <th style={{width: '10%', textAlign: 'center'}}>ID</th>
                    <th style={{width: '25%'}}>Indicador</th>
                    <th style={{width: '25%'}}>Unidade</th>
                    <th style={{width: '10%', textAlign: 'center'}}>Ano</th>
                    <th style={{width: '10%', textAlign: 'center'}}>Mês</th>
                    <th style={{width: 180, textAlign: 'center'}}>Ações</th>
                </tr>
                </thead>
                <tbody>
                {q.isLoading && items.length === 0 ? (
                    <tr><td colSpan={7}>Carregando...</td></tr>
                ) : filtrados.length === 0 ? (
                    <tr><td colSpan={7}>Nenhum registro encontrado.</td></tr>
                ) : (
                    filtrados.map((item) => {
                        const row = rec(item);
                        const chave = str(row.id);
                        const metaId = num(row.id) ?? 0;
                        const aberto = Boolean(expandido[chave]);
                        return (
                            <Fragment key={chave}>
                                <tr>
                                    <td style={{textAlign: 'center'}}>
                                        <button
                                            type="button"
                                            className="btn-row-toggle"
                                            title={aberto ? 'Recolher' : 'Expandir'}
                                            onClick={() => alternarExpansao(chave)}
                                        >
                                            {aberto ? '▾' : '▸'}
                                        </button>
                                    </td>
                                    <td style={{textAlign: 'center'}}>{chave}</td>
                                    <td>{str(row.indicador_nome)}</td>
                                    <td>{str(row.unidade_sucinto)}</td>
                                    <td style={{textAlign: 'center'}}>{str(row.ano)}</td>
                                    <td style={{textAlign: 'center'}}>{mesLabel(row.mes) || 'Todos os meses'}</td>
                                    <td style={{textAlign: 'center', whiteSpace: 'nowrap'}}>
                                        {can('UPDATE') && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btngreen"
                                                    title="Editar parâmetros"
                                                    onClick={() => navigate(`/view/meta/formMetaDinamica?id=${chave}`)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btnorange"
                                                    title="Editar valores"
                                                    onClick={() => navigate(`/view/meta/formMetaDinamica?id=${chave}&valores=1`)}
                                                >
                                                    Valores
                                                </button>
                                            </>
                                        )}
                                        {can('DELETE') && (
                                            <button
                                                type="button"
                                                className="btnred"
                                                title="Remover"
                                                disabled={removendo === metaId}
                                                onClick={() => {
                                                    if (window.confirm(`Deseja realmente excluir a meta #${chave}?`)) {
                                                        void remover(metaId);
                                                    }
                                                }}
                                            >
                                                Remover
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                {aberto && (
                                    <tr className="row-detail">
                                        <td colSpan={7}>
                                            <div className="sub-columns">
                                                <div>
                                                    <span className="sub-column-label">Metas</span>
                                                    <MetasDaMeta metaId={metaId}/>
                                                </div>
                                            </div>
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
                    <td colSpan={7} className="data-table-paginator">
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
    );
}

export default function ViewMetaListMetaDinamicaListScreen() {
    const navigate = useNavigate();

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group">
                                <span className="breadcrumb-item breadcrumb-current">Meta Dinâmica</span>
                            </div>
                        </nav>
                    </div>
                    <div className="page-header-actions">
                        <button
                            type="button"
                            className="btnblue"
                            onClick={() => navigate('/view/meta/formMetaDinamica')}
                        >
                            Nova meta
                        </button>
                    </div>
                </div>

                <div style={{maxWidth: 1180, margin: '0 auto', padding: '0 16px 24px'}}>
                    <Tabs
                        initial="meta"
                        tabs={[
                            {
                                key: 'meta',
                                label: 'Meta',
                                content: (
                                    <div style={{marginTop: 16}}>
                                        <MetaDinamicaEditor onVoltar={() => navigate('/view/indicador/listIndicador')}/>
                                    </div>
                                ),
                            },
                            {
                                key: 'listagem',
                                label: 'Listagem',
                                content: (
                                    <div style={{marginTop: 16}}>
                                        <ListagemMetasDinamicas/>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            </main>
        </PermissionGate>
    );
}
