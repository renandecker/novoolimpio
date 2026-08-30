import {useState, useEffect} from 'react';
import {PermissionGate, usePermissions, useCurrentOutcome} from '../permissions';
import {api} from '../api';
import {useModulePaged} from '../useModulePaged';
import type {ApiItem} from '../types';
import {legacyClassName} from '../DataTable';
import {PAGE_SIZES} from '../DataTable';
import {RowMenu, type RowMenuItem} from '../RowMenu';
import {ExportDropdown} from '../ExportDropdown';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const ACTIVE_COLUMN_RE = /ativo|situacao|status|fl_ativo|fl_situacao|fl_status/i;

const renderValue = (item: ApiItem, key: string) => {
    const value = asRecord(item)[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);

    let boolVal: boolean | null = null;
    if (typeof value === 'boolean') {
        boolVal = value;
    } else if (value === 'true' || value === 'false') {
        boolVal = value === 'true';
    } else if (value === 1 || value === 0) {
        boolVal = value === 1;
    } else if (value === '1' || value === '0') {
        boolVal = value === '1';
    }

    if (boolVal !== null) {
        if (ACTIVE_COLUMN_RE.test(key)) {
            return boolVal ? 'ATIVO' : 'INATIVO';
        } else {
            return boolVal ? 'SIM' : 'NÃO';
        }
    }
    return String(value);
};

const OFERECIMENTO_COLUMNS = [
    {key: 'id', label: 'ID'},
    {key: 'grupo_nome', label: 'Grupo'},
    {key: 'unidade_sucinto', label: 'Unidade'},
    {key: 'curso_nome', label: 'Curso'},
    {key: 'componente_curricular_descricao', label: 'Componente Curricular'},
    {key: 'sala_numero', label: 'Sala'},
    {
        key: 'inscritos_vagas',
        label: 'Inscritos / Vagas',
        render: (item: ApiItem) => {
            const record = asRecord(item);
            return `${record.inscritos ?? 0} / ${record.vagas ?? 0}`;
        },
    },
    {key: 'professor_nome', label: 'Professor'},
    {key: 'data_inicio', label: 'Data Início', render: (item) => formatDate(asRecord(item).data_inicio)},
    {key: 'data_fim', label: 'Data Fim', render: (item) => formatDate(asRecord(item).data_fim)},
    {
        key: 'replicar',
        label: 'Replicar',
        render: (item) => (asRecord(item).replicar ? 'Sim' : 'Não'),
    },
    {
        key: 'status',
        label: 'Status',
        render: (item) => {
            const value = String(asRecord(item).status ?? '');
            const cls = legacyClassName(value);
            return <span className={cls ?? ''}>{value}</span>;
        },
    },
];

const exportarPDF = (item: ApiItem) => {
    window.open(`/api/relatorios/relatorio/disponiveis/TABELA/${item.id}`, '_blank');
};

const exportarDOCX = (item: ApiItem) => {
    // Exportar DOCX
};

const exportarExcel = (item: ApiItem) => {
    window.open(`/api/relatorios/relatorio/disponiveis/GRAFICO/${item.id}`, '_blank');
};

export default function ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen() {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [movimentacoes, setMovimentacoes] = useState<Record<number, any[]>>({});
    const [loadingMov, setLoadingMov] = useState<Record<number, boolean>>({});
    const [infoDialog, setInfoDialog] = useState<{open: boolean; entity: any | null}>({open: false, entity: null});
    const [replicarDialog, setReplicarDialog] = useState<{open: boolean; entity: any | null; action: 'ativar' | 'desativar'}>({open: false, entity: null, action: 'ativar'});
    const [deleteDialog, setDeleteDialog] = useState<{open: boolean; entity: any | null}>({open: false, entity: null});

    const {can} = usePermissions();
    const outcome = useCurrentOutcome();

    const [perfilModuloPermissions, setPerfilModuloPermissions] = useState<any>(null);
    const [perfilModuloLoading, setPerfilModuloLoading] = useState(false);

    useEffect(() => {
        const carregarPermissoes = async () => {
            setPerfilModuloLoading(true);
            try {
                const response = await api.get(`/api/permissao/permissoes?caminho=${outcome}`);
                setPerfilModuloPermissions(response.data);
            } catch (error) {
                console.error('Erro ao carregar permissões do perfil-modulo:', error);
            } finally {
                setPerfilModuloLoading(false);
            }
        };
        carregarPermissoes();
    }, [outcome]);

    const acessoRelatorios = can('EXECUTE', outcome) || (perfilModuloPermissions?.relatorio ?? false);
    const acessoEditar = can('UPDATE', outcome) || (perfilModuloPermissions?.editar ?? false);
    const acessoRemover = can('DELETE', outcome) || (perfilModuloPermissions?.remover ?? false);

    const q = useModulePaged('/api/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular', page, size);
    const all = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);

    const handleInfo = (entity: any) => {
        setInfoDialog({open: true, entity});
    };

    const handleReplicar = (entity: any, action: 'ativar' | 'desativar') => {
        setReplicarDialog({open: true, entity, action});
    };

    const handleDelete = (entity: any) => {
        setDeleteDialog({open: true, entity});
    };

    const confirmReplicar = async () => {
        if (!replicarDialog.entity) return;
        try {
            if (replicarDialog.action === 'ativar') {
                await api.post(`/api/educacao/oferecimento-componente-curricular/${replicarDialog.entity.id}/ativar-replicar`);
            } else {
                await api.post(`/api/educacao/oferecimento-componente-curricular/${replicarDialog.entity.id}/desativar-replicar`);
            }
            setReplicarDialog({open: false, entity: null, action: 'ativar'});
            q.refetch();
        } catch (e) {
            alert('Erro ao alterar replicação');
        }
    };

    const confirmDelete = async () => {
        if (!deleteDialog.entity) return;
        try {
            await api.delete(`/api/educacao/oferecimento-componente-curricular/${deleteDialog.entity.id}`);
            setDeleteDialog({open: false, entity: null});
            q.refetch();
        } catch (e) {
            alert('Erro ao excluir');
        }
    };

    const toggleExpand = async (entity: any) => {
        const id = entity.id;
        const isOpen = expanded[id];
        const newExpanded = {...expanded, [id]: !isOpen};
        setExpanded(newExpanded);

        if (!isOpen && !movimentacoes[id] && !loadingMov[id]) {
            setLoadingMov(prev => ({...prev, [id]: true}));
            try {
                const {data} = await api.get(`/api/educacao/ocorrencia-componente-curricular`, {
                    params: {oferecimentoId: id}
                });
                setMovimentacoes(prev => ({...prev, [id]: data ?? []}));
            } catch (e) {
                console.error('Erro ao carregar ocorrências:', e);
                setMovimentacoes(prev => ({...prev, [id]: []}));
            } finally {
                setLoadingMov(prev => ({...prev, [id]: false}));
            }
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Oferecimento Componente Curricular</h1>
                <div className="data-table-toolbar" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {acessoRelatorios && (
                        <ExportDropdown
                            options={[
                                {
                                    key: 'pdf',
                                    label: 'PDF',
                                    icon: <i className="fa fa-file-pdf-o"/>,
                                    onClick: () => {
                                        if (all.length > 0) exportarPDF(asRecord(all[0]));
                                    }
                                },
                                {
                                    key: 'docx',
                                    label: 'DOCX',
                                    icon: <i className="fa fa-file-word-o"/>,
                                    onClick: () => {
                                        if (all.length > 0) exportarDOCX(asRecord(all[0]));
                                    }
                                },
                                {
                                    key: 'excel',
                                    label: 'Excel',
                                    icon: <i className="fa fa-file-excel-o"/>,
                                    onClick: () => {
                                        if (all.length > 0) exportarExcel(asRecord(all[0]));
                                    }
                                }
                            ]}
                            triggerLabel="Exportar"
                            triggerIcon={<i className="fa fa-download"/>}
                        />
                    )}
                </div>
                <div className="data-table">
                    {q.isError ? (
                        <p>Erro ao carregar os oferecimentos.</p>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                {OFERECIMENTO_COLUMNS.map((column) => (
                                    <th key={column.key}>{column.label}</th>
                                ))}
                                <th className="col-actions">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {q.isLoading && all.length === 0 ? (
                                <tr>
                                    <td colSpan={OFERECIMENTO_COLUMNS.length + 1}>Carregando...</td>
                                </tr>
                            ) : all.length === 0 ? (
                                <tr>
                                    <td colSpan={OFERECIMENTO_COLUMNS.length + 1}>Nenhum registro encontrado.</td>
                                </tr>
                            ) : (
                                all.map((item) => {
                                    const record = asRecord(item);
                                    const id = Number(record.id);
                                    const isOpen = Boolean(expanded[id]);
                                    const movs = movimentacoes[id] ?? [];
                                    const loading = loadingMov[id];
                                    const status = String(record.status ?? '');
                                    const replicar = Boolean(record.replicar);

                                    const relatoriosItems: RowMenuItem[] = [
                                        {
                                            key: 'info',
                                            label: 'Informações',
                                            className: 'btnyellow',
                                            onSelect: () => handleInfo(record),
                                        },
                                    ];

                                    const editarItems: RowMenuItem[] = [
                                        {
                                            key: replicar ? 'desativarReplicar' : 'ativarReplicar',
                                            label: replicar ? 'Desativar Replicação' : 'Ativar Replicação',
                                            className: replicar ? 'btnorange' : 'btnblue',
                                            onSelect: () => handleReplicar(record, replicar ? 'desativar' : 'ativar'),
                                        },
                                        {
                                            key: 'replicar',
                                            label: 'Replicar Oferecimento',
                                            className: 'btnblack',
                                            onSelect: () => window.open(`/api/educacao/oferecimento-componente-curricular/${id}/replicar`, '_blank'),
                                        },
                                        {
                                            key: 'editar',
                                            label: 'Editar',
                                            className: 'btngreen',
                                            onSelect: () => window.location.href = `/view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular?id=${id}`,
                                        },
                                    ];

                                    const removerItems: RowMenuItem[] = [
                                        {
                                            key: 'excluir',
                                            label: 'Excluir',
                                            className: 'btnred',
                                            onSelect: () => handleDelete(record),
                                        },
                                    ];

                                    return [
                                        <tr key={`${id}-row`}>
                                            {OFERECIMENTO_COLUMNS.map((column) => (
                                                <td key={column.key}>
                                                    {column.render ? column.render(item) : renderValue(item, column.key)}
                                                </td>
                                            ))}
                                            <td className="col-actions">
                                                <div className="row-actions-menu">
                                                    {acessoRelatorios && (
                                                        <RowMenu icon={<i className="fa fa-info-circle"/>}
                                                                 className="btnyellow" title="Relatórios"
                                                                 items={relatoriosItems}/>
                                                    )}
                                                    {acessoEditar && (
                                                        <RowMenu icon={<i className="fa fa-pencil"/>}
                                                                 className="btngreen" title="Editar"
                                                                 items={editarItems}/>
                                                    )}
                                                    {acessoRemover && (
                                                        <RowMenu icon={<i className="fa fa-trash"/>}
                                                                 className="btnred" title="Remover"
                                                                 items={removerItems}/>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>,
                                        isOpen && (
                                            <tr key={`${id}-detail`} className="row-detail">
                                                <td colSpan={OFERECIMENTO_COLUMNS.length + 1}>
                                                    <div className="master-detail-content">
                                                        {loading ? (
                                                            <p>Carregando ocorrências...</p>
                                                        ) : movs.length === 0 ? (
                                                            <p className="master-detail-empty">Nenhuma ocorrência encontrada.</p>
                                                        ) : (
                                                            <table className="master-detail-table">
                                                                <thead>
                                                                <tr>
                                                                    <th>Data</th>
                                                                    <th>Dia Semana</th>
                                                                    <th>Turno</th>
                                                                    <th>Tempo Aula</th>
                                                                    <th>Sala</th>
                                                                    <th>Aula Presencial</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {movs.map((mov: any) => (
                                                                    <tr key={mov.id}>
                                                                        <td>{formatDate(mov.data)}</td>
                                                                        <td>{mov.diaAula?.diaSemana?.nome ?? ''}</td>
                                                                        <td>{mov.diaAula?.turnoEducacao?.descricao ?? ''}</td>
                                                                        <td>{mov.diaAula?.tempoAula?.descricao ?? ''}</td>
                                                                        <td>{mov.sala?.numero ?? mov.sala?.descricao ?? ''}</td>
                                                                        <td>{mov.aulaPresencial ? 'Sim' : 'Não'}</td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                        ]
                                })
                            )}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan={OFERECIMENTO_COLUMNS.length + 1} className="data-table-paginator">
                                    <button onClick={() => setPage(current => Math.max(0, current - 1))} disabled={page === 0 || q.isFetching}>
                                        Anterior
                                    </button>
                                    <span>Página {page + 1} de {totalPages}</span>
                                    <button onClick={() => setPage(current => Math.min(totalPages - 1, current + 1))} disabled={page >= totalPages - 1 || q.isFetching}>
                                        Próxima
                                    </button>
                                    <label>
                                        Registros por página
                                        <select value={size} onChange={e => { setSize(Number(e.target.value)); setPage(0); }}>
                                            {PAGE_SIZES.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                    </label>
                                    <span>Total: {totalElements}</span>
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    )}

                    {/* Info Dialog */}
                    {infoDialog.open && infoDialog.entity && (
                        <div className="modal-overlay" onClick={() => setInfoDialog({open: false, entity: null})}>
                            <div className="modal form-modal" onClick={e => e.stopPropagation()}>
                                <div className="div_form">
                                    <div className="form-title">Informações do Oferecimento</div>
                                    <div className="table_form">
                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px'}}>
                                            <div><strong>Oferecimento:</strong> {infoDialog.entity.id}</div>
                                            <div><strong>Componente:</strong> {infoDialog.entity.componente_curricular_descricao ?? ''}</div>
                                            <div><strong>Status:</strong> <span className={legacyClassName(infoDialog.entity.status) ?? ''}>{infoDialog.entity.status}</span></div>
                                            <div><strong>Professor:</strong> {infoDialog.entity.professor_nome ?? ''}</div>
                                        </div>
                                        <h4>Dias de Aula</h4>
                                        <table className="master-detail-table">
                                            <thead>
                                            <tr><th>Dia Semana</th><th>Turno</th><th>Tempo Aula</th></tr>
                                            </thead>
                                            <tbody>
                                            {movimentacoes[infoDialog.entity.id]?.map((dia: any) => (
                                                <tr key={dia.id}>
                                                    <td>{dia.diaAula?.diaSemana?.nome ?? ''}</td>
                                                    <td>{dia.diaAula?.turnoEducacao?.descricao ?? ''}</td>
                                                    <td>{dia.diaAula?.tempoAula?.descricao ?? ''}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <div className="form-footer" style={{marginTop: '16px'}}>
                                            <button type="button" className="btn-form-back" onClick={() => setInfoDialog({open: false, entity: null})}>Fechar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Replicar Dialog */}
                    {replicarDialog.open && replicarDialog.entity && (
                        <div className="modal-overlay" onClick={() => setReplicarDialog({open: false, entity: null, action: 'ativar'})}>
                            <div className="modal form-modal" onClick={e => e.stopPropagation()}>
                                <div className="div_form">
                                    <div className="form-title">{replicarDialog.action === 'ativar' ? 'Ativar Replicação' : 'Desativar Replicação'}</div>
                                    <div className="table_form">
                                        <p>Deseja {replicarDialog.action === 'ativar' ? 'ativar' : 'desativar'} a replicação?</p>
                                        <div className="form-footer" style={{marginTop: '16px'}}>
                                            <button type="button" className="btn-form-save" onClick={confirmReplicar}>Sim</button>
                                            <button type="button" className="btn-form-back" onClick={() => setReplicarDialog({open: false, entity: null, action: 'ativar'})}>Não</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Dialog */}
                    {deleteDialog.open && deleteDialog.entity && (
                        <div className="modal-overlay" onClick={() => setDeleteDialog({open: false, entity: null})}>
                            <div className="modal form-modal" onClick={e => e.stopPropagation()}>
                                <div className="div_form">
                                    <div className="form-title">Confirmação</div>
                                    <div className="table_form">
                                        <p>Tem certeza que deseja excluir este oferecimento?</p>
                                        <div className="form-footer" style={{marginTop: '16px'}}>
                                            <button type="button" className="btnred" onClick={confirmDelete}>Sim</button>
                                            <button type="button" className="btn-form-back" onClick={() => setDeleteDialog({open: false, entity: null})}>Não</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </PermissionGate>
    );
}