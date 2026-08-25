import {useState} from 'react';
import {PermissionGate, useCurrentOutcome} from '../permissions';
import {api} from '../api';
import {useModulePaged} from '../useModulePaged';
import type {ApiItem} from '../types';
import {legacyClassName} from '../DataTable';
import {ExportDropdown} from '../ExportDropdown';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const formatDateTime = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(str);
    if (!match) return str;
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
};

const formatCurrency = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
};

type Movimentacao = {
    id: number;
    parcelaId: number;
    contratoId: number;
    aluno: string;
    parcelaSequencia: number;
    dataMovimento: string;
    vencimento: string;
    formaPagamento: string;
    valor: number;
    desconto: number;
    multaJuros: number;
    troco: number;
    total: number;
    tipoMovimento: string;
};

type CaixaRow = {
    id: number;
    idCaixaUnidade: string;
    usuario: string;
    unidade: string;
    data: string;
    dataFechamento: string | null;
    fundoCaixa: number;
    movimentacoes?: Movimentacao[];
};

const COLUMNS = [
    {key: 'id_caixa_unidade', label: 'Nº Caixa'},
    {key: 'usuario_login', label: 'Usuário'},
    {key: 'unidade_sucinto', label: 'Unidade'},
    {key: 'data', label: 'Data', render: (item: ApiItem) => formatDateTime(asRecord(item).data)},
    {key: 'data_fechamento', label: 'Data Fechamento', render: (item: ApiItem) => asRecord(item).data_fechamento ? formatDateTime(asRecord(item).data_fechamento) : ''},
    {key: 'fundo_caixa', label: 'Fundo de Caixa', render: (item: ApiItem) => formatCurrency(asRecord(item).fundo_caixa)},
];

export default function ViewCaixaListCaixaListScreen() {
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [movimentacoes, setMovimentacoes] = useState<Record<number, Movimentacao[]>>({});
    const [loadingMovimentacoes, setLoadingMovimentacoes] = useState<Record<number, boolean>>({});
    const [fluxoCaixaDialog, setFluxoCaixaDialog] = useState<{open: boolean; caixa: CaixaRow | null}>({open: false, caixa: null});

    const q = useModulePaged('/api/view/caixa/listCaixa', 0, 10);
    const all = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);
    const [page, setPage] = useState(0);

    const toggleExpand = async (row: CaixaRow) => {
        const id = row.id;
        const isOpen = expandedRows[id];
        const newExpanded = {...expandedRows, [id]: !isOpen};
        setExpandedRows(newExpanded);

        if (!isOpen && !movimentacoes[id] && !loadingMovimentacoes[id]) {
            setLoadingMovimentacoes(prev => ({...prev, [id]: true}));
            try {
                const {data} = await api.get<Movimentacao[]>(`/api/financeiro/caixa/${id}/movimentacoes`);
                setMovimentacoes(prev => ({...prev, [id]: data ?? []}));
            } catch (e) {
                console.error('Erro ao carregar movimentações:', e);
                setMovimentacoes(prev => ({...prev, [id]: []}));
            } finally {
                setLoadingMovimentacoes(prev => ({...prev, [id]: false}));
            }
        }
    };

    const openFluxoCaixa = (row: CaixaRow) => {
        setFluxoCaixaDialog({open: true, caixa: row});
    };

    const closeFluxoCaixa = () => {
        setFluxoCaixaDialog({open: false, caixa: null});
    };

    const renderMovimentacaoIcon = (tipo: string) => {
        if (tipo === 'ENTRADA' || tipo === '1') return '➕';
        if (tipo === 'SAIDA' || tipo === '2') return '➖';
        if (tipo === 'SANGRIA' || tipo === '3') return '💸';
        return '📦';
    };

    const exportOptions = [
        {key: 'pdf', label: 'PDF', icon: <i className="fa fa-file-pdf-o"/>, onClick: () => alert('Exportar PDF - não implementado')},
        {key: 'docx', label: 'DOCX', icon: <i className="fa fa-file-word-o"/>, onClick: () => alert('Exportar DOCX - não implementado')},
        {key: 'excel', label: 'Excel', icon: <i className="fa fa-file-excel-o"/>, onClick: () => alert('Exportar Excel - não implementado')},
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Caixa</h1>
                <div className="data-table-toolbar" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <ExportDropdown options={exportOptions} triggerLabel="Exportar" triggerIcon={<i className="fa fa-download"/>}/>
                </div>
                <div className="data-table">
                    {q.isError ? (
                        <p>Erro ao carregar os caixas.</p>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th className="col-toggle"></th>
                                {COLUMNS.map((column) => (
                                    <th key={column.key}>{column.label}</th>
                                ))}
                                <th className="col-actions">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {q.isLoading && all.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS.length + 2}>Carregando...</td>
                                </tr>
                            ) : all.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS.length + 2}>Nenhum registro encontrado.</td>
                                </tr>
                            ) : (
                                all.map((item) => {
                                    const row = asRecord(item);
                                    const caixaId = Number(row.id);
                                    const isOpen = Boolean(expandedRows[caixaId]);
                                    const movs = movimentacoes[caixaId] ?? [];
                                    const loading = loadingMovimentacoes[caixaId];
                                    const caixaRow: CaixaRow = {
                                        id: caixaId,
                                        idCaixaUnidade: String(row.id_caixa_unidade ?? ''),
                                        usuario: String(row.usuario_login ?? ''),
                                        unidade: String(row.unidade_sucinto ?? ''),
                                        data: String(row.data ?? ''),
                                        dataFechamento: row.data_fechamento ? String(row.data_fechamento) : null,
                                        fundoCaixa: Number(row.fundo_caixa ?? 0),
                                    };

                                    return [
                                        <tr key={`${caixaId}-row`}>
                                            <td className="col-toggle">
                                                <button
                                                    type="button"
                                                    className="btn-row-toggle"
                                                    title={isOpen ? 'Recolher' : 'Expandir'}
                                                    onClick={() => toggleExpand(caixaRow)}
                                                    disabled={loading}
                                                >
                                                    {isOpen ? '▾' : '▸'}
                                                </button>
                                            </td>
                                            {COLUMNS.map((column) => (
                                                <td key={column.key}>
                                                    {column.render ? column.render(item) : String(row[column.key] ?? '')}
                                                </td>
                                            ))}
                                            <td className="col-actions">
                                                <div className="row-actions-menu">
                                                    <button
                                                        type="button"
                                                        className="btn-action btnblue"
                                                        title="Fluxo Caixa"
                                                        onClick={() => openFluxoCaixa(caixaRow)}
                                                    >
                                                        📊
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-action btnblue"
                                                        title="Imprimir"
                                                        disabled={!caixaRow.dataFechamento}
                                                    >
                                                        🖨️
                                                    </button>
                                                    {caixaRow.dataFechamento ? (
                                                        <button
                                                            type="button"
                                                            className="btn-action btnstop"
                                                            title="Reabrir Caixa"
                                                            onClick={() => alert('Reabrir caixa - não implementado')}
                                                        >
                                                            🔓
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn-action btnred"
                                                            title="Fechar Caixa"
                                                            onClick={() => alert('Fechar caixa - não implementado')}
                                                        >
                                                            🔒
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>,
                                        isOpen && (
                                            <tr key={`${caixaId}-detail`} className="row-detail">
                                                <td colSpan={COLUMNS.length + 2}>
                                                    <div className="master-detail-content">
                                                        {loading ? (
                                                            <p>Carregando movimentações...</p>
                                                        ) : movs.length === 0 ? (
                                                            <p className="master-detail-empty">Nenhuma movimentação encontrada.</p>
                                                        ) : (
                                                            <table className="master-detail-table">
                                                                <thead>
                                                                <tr>
                                                                    <th>Tipo</th>
                                                                    <th>ID</th>
                                                                    <th>Contrato</th>
                                                                    <th>Aluno</th>
                                                                    <th>Parcela</th>
                                                                    <th>Data Movimento</th>
                                                                    <th>Vencimento</th>
                                                                    <th>Forma Pagamento</th>
                                                                    <th>Valor</th>
                                                                    <th>Desconto</th>
                                                                    <th>Juros/Multa</th>
                                                                    <th>Troco</th>
                                                                    <th>Total</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {movs.map((mov) => (
                                                                    <tr key={mov.id}>
                                                                        <td>{renderMovimentacaoIcon(mov.tipoMovimento)}</td>
                                                                        <td>{mov.id}</td>
                                                                        <td>{mov.contratoId}</td>
                                                                        <td>{mov.aluno}</td>
                                                                        <td>{mov.parcelaSequencia}</td>
                                                                        <td>{formatDateTime(mov.dataMovimento)}</td>
                                                                        <td>{formatDateTime(mov.vencimento)}</td>
                                                                        <td>{mov.formaPagamento}</td>
                                                                        <td>{formatCurrency(mov.valor)}</td>
                                                                        <td>{formatCurrency(mov.desconto)}</td>
                                                                        <td>{formatCurrency(mov.multaJuros)}</td>
                                                                        <td>{formatCurrency(mov.troco)}</td>
                                                                        <td>{formatCurrency(mov.total)}</td>
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
                                <td colSpan={COLUMNS.length + 2} className="data-table-paginator">
                                    <button onClick={() => setPage(current => Math.max(0, current - 1))} disabled={page === 0 || q.isFetching}>
                                        Anterior
                                    </button>
                                    <span>Página {page + 1} de {totalPages}</span>
                                    <button onClick={() => setPage(current => Math.min(totalPages - 1, current + 1))} disabled={page >= totalPages - 1 || q.isFetching}>
                                        Próxima
                                    </button>
                                    <label>
                                        Registros por página
                                        <select value={10} onChange={e => { setPage(0); }}>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </label>
                                    <span>Total: {totalElements}</span>
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                {fluxoCaixaDialog.open && fluxoCaixaDialog.caixa && (
                    <div className="modal-overlay" onClick={closeFluxoCaixa}>
                        <div className="modal form-modal" onClick={e => e.stopPropagation()}>
                            <div className="div_form">
                                <div className="form-title">Fluxo de Caixa</div>
                                <div className="table_form">
                                    <div className="fluxo-caixa-header">
                                        <div className="fluxo-item">
                                            <span className="fluxo-label">Caixa:</span>
                                            <span className="fluxo-value">{fluxoCaixaDialog.caixa.idCaixaUnidade}</span>
                                        </div>
                                        <div className="fluxo-item">
                                            <span className="fluxo-label">Unidade:</span>
                                            <span className="fluxo-value">{fluxoCaixaDialog.caixa.unidade}</span>
                                        </div>
                                    </div>
                                    <table className="fluxo-totais-table">
                                        <thead>
                                        <tr>
                                            <th>Fundo Caixa</th>
                                            <th>Total Dinheiro</th>
                                            <th>Total Cheque</th>
                                            <th>Total Cartão</th>
                                            <th>Total Boleto</th>
                                            <th>Total Transferência</th>
                                            <th>Total Depósito</th>
                                            <th>Total Sangria</th>
                                            <th>Valor</th>
                                            <th>Desconto</th>
                                            <th>Juros/Multa</th>
                                            <th>Valor Total</th>
                                            <th>Valor Total Caixa</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{formatCurrency(fluxoCaixaDialog.caixa.fundoCaixa)}</td>
                                            <td colspan="12" style={{textAlign: 'center', color: '#666'}}>Totais calculados no servidor (não implementado)</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <h3 style={{marginTop: '20px', marginBottom: '10px'}}>Movimentações</h3>
                                    <div className="fluxo-movimentacoes">
                                        <table className="master-detail-table">
                                            <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>ID</th>
                                                <th>Contrato/Venda</th>
                                                <th>Aluno</th>
                                                <th>Parcela</th>
                                                <th>Vencimento</th>
                                                <th>Horário</th>
                                                <th>Descrição</th>
                                                <th>Forma Pagamento</th>
                                                <th>Valor Parcela</th>
                                                <th>Desconto</th>
                                                <th>Multa/Juros</th>
                                                <th>Troco</th>
                                                <th>Valor</th>
                                                <th>Total</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {movimentacoes[fluxoCaixaDialog.caixa.id]?.map((mov) => (
                                                <tr key={mov.id}>
                                                    <td>{renderMovimentacaoIcon(mov.tipoMovimento)}</td>
                                                    <td>{mov.id}</td>
                                                    <td>{mov.contratoId}</td>
                                                    <td>{mov.aluno}</td>
                                                    <td>{mov.parcelaSequencia}</td>
                                                    <td>{formatDateTime(mov.vencimento)}</td>
                                                    <td>{formatDateTime(mov.dataMovimento).split(' ')[1] || ''}</td>
                                                    <td>{mov.formaPagamento}</td>
                                                    <td>{formatCurrency(mov.valor)}</td>
                                                    <td>{formatCurrency(mov.desconto)}</td>
                                                    <td>{formatCurrency(mov.multaJuros)}</td>
                                                    <td>{formatCurrency(mov.troco)}</td>
                                                    <td>{formatCurrency(mov.valor)}</td>
                                                    <td>{formatCurrency(mov.total)}</td>
                                                </tr>
                                            ))}
                                            {(!movimentacoes[fluxoCaixaDialog.caixa.id] || movimentacoes[fluxoCaixaDialog.caixa.id]!.length === 0) && (
                                                <tr>
                                                    <td colSpan={15} className="master-detail-empty">Nenhuma movimentação.</td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="form-footer" style={{marginTop: '16px'}}>
                                        <button type="button" className="btn-form-back" onClick={closeFluxoCaixa}>Fechar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}