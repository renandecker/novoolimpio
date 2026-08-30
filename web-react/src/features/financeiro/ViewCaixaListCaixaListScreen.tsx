import {useState, useMemo} from 'react';
import {PermissionGate, useCurrentOutcome} from '../../shared/services/permissions';
import {api} from '../../shared/services/api';
import {useModulePaged} from '../../shared/hooks/useModulePaged';
import type {ApiItem} from '../../shared/types/index';
import {legacyClassName} from '../../shared/components/DataTable';
import {ExportDropdown} from '../../shared/components/ExportDropdown';

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
    {key: 'unidade_sucinto', label: 'Id_unidade'},
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

    const [totaisCaixa, setTotaisCaixa] = useState<Record<number, any>>({});
    const [loadingTotais, setLoadingTotais] = useState<Record<number, boolean>>({});

    const openFluxoCaixa = async (row: CaixaRow) => {
        setFluxoCaixaDialog({open: true, caixa: row});
        if (!totaisCaixa[row.id] && !loadingTotais[row.id]) {
            setLoadingTotais(prev => ({...prev, [row.id]: true}));
            try {
                const {data} = await api.get(`/api/financeiro/caixa/${row.id}/totais-fechamento`);
                setTotaisCaixa(prev => ({...prev, [row.id]: data}));
            } catch (e) {
                console.error('Erro ao carregar totais:', e);
            } finally {
                setLoadingTotais(prev => ({...prev, [row.id]: false}));
            }
        }
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

    const handleExcluirMovimentacao = async (mov: Movimentacao) => {
        if (window.confirm(`Excluir movimentação ${mov.id}?`)) {
            try {
                await api.delete(`/api/financeiro/movimentacao-financeira/${mov.id}`);
                alert('Movimentação excluída com sucesso');
            } catch (e) {
                alert('Erro ao excluir movimentação');
            }
        }
    };

    const handleSegundaViaPagamento = async (mov: Movimentacao) => {
        try {
            await api.post(`/api/financeiro/caixa/imprimir-comprovante-pagamento`, {movimentacaoFinanceiraId: mov.id});
            alert('Comprovante enviado para impressão');
        } catch (e) {
            alert('Erro ao gerar segunda via');
        }
    };

    const handleSegundaViaSangria = async (mov: Movimentacao) => {
        try {
            await api.post(`/api/financeiro/sangria/${mov.id}/imprimir`);
            alert('Segunda via da sangria enviada para impressão');
        } catch (e) {
            alert('Erro ao gerar segunda via da sangria');
        }
    };

    const shouldShowExcluir = () => true;
    const shouldShowSegundaViaPagamento = (tipo: string) => tipo === 'ENTRADA' || tipo === '1';
    const shouldShowSegundaViaSangria = (tipo: string) => tipo === 'SANGRIA' || tipo === '3';

    const handleExport = async (format: 'pdf' | 'docx' | 'excel') => {
        try {
            const response = await api.get(`/api/financeiro/caixa/exportar/${format}`, {responseType: 'blob'});
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `caixa-relatorio.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert(`Erro ao exportar ${format.toUpperCase()}`);
        }
    };

    const exportOptions = [
        {key: 'pdf', label: 'PDF', icon: <i className="fa fa-file-pdf-o"/>, onClick: () => handleExport('pdf')},
        {key: 'docx', label: 'DOCX', icon: <i className="fa fa-file-word-o"/>, onClick: () => handleExport('docx')},
        {key: 'excel', label: 'Excel', icon: <i className="fa fa-file-excel-o"/>, onClick: () => handleExport('excel')},
    ];

    const calculateTotals = (movs: Movimentacao[]) => {
        const totals = {
            totalDinheiro: 0,
            totalCheque: 0,
            totalCartao: 0,
            totalBoleto: 0,
            totalTransferencia: 0,
            totalDeposito: 0,
            totalSangria: 0,
            totalValor: 0,
            totalDesconto: 0,
            totalJurosMulta: 0,
            totalValorPagar: 0,
        };
        movs.forEach(mov => {
            const forma = mov.formaPagamento?.toUpperCase() || '';
            const valor = Number(mov.valor) || 0;
            const desconto = Number(mov.desconto) || 0;
            const multaJuros = Number(mov.multaJuros) || 0;
            const total = Number(mov.total) || 0;
            totals.totalValor += valor;
            totals.totalDesconto += desconto;
            totals.totalJurosMulta += multaJuros;
            totals.totalValorPagar += total;
            if (forma.includes('DINHEIRO')) totals.totalDinheiro += total;
            else if (forma.includes('CHEQUE')) totals.totalCheque += total;
            else if (forma.includes('CARTÃO') || forma.includes('CARTAO')) totals.totalCartao += total;
            else if (forma.includes('BOLETO')) totals.totalBoleto += total;
            else if (forma.includes('TRANSFER') || forma.includes('PIX')) totals.totalTransferencia += total;
            else if (forma.includes('DEPÓSITO') || forma.includes('DEPOSITO')) totals.totalDeposito += total;
            if (mov.tipoMovimento === 'SANGRIA' || mov.tipoMovimento === '3') totals.totalSangria += total;
        });
        return totals;
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <span className="breadcrumb-current">Gerência Fluxo Caixa</span>
                    </div>
                    <div className="page-header-actions">
                        <ExportDropdown options={exportOptions} triggerLabel="Exportar" triggerIcon={<i className="fa fa-download"/>} triggerClassName="btnyellow"/>
                    </div>
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
                                                          <i className="fa fa-bar-chart"/>
                                                      </button>
                                                     <button
                                                         type="button"
                                                         className="btn-action btnblue"
                                                          title="Imprimir"
                                                          disabled={!caixaRow.dataFechamento}
                                                      >
                                                          <i className="fa fa-print"/>
                                                      </button>
                                                       {!caixaRow.dataFechamento ? (
                                                           <button
                                                               type="button"
                                                               className="btn-action btnred"
                                                               title="Fechar Caixa"
                                                               onClick={async () => {
                                                                   if (window.confirm('Tem certeza que deseja fechar este caixa?')) {
                                                                       try {
                                                                           await api.post(`/api/financeiro/caixa/${caixaRow.id}/fechar`);
                                                                           alert('Caixa fechado com sucesso');
                                                                           q.refetch();
                                                                       } catch (e) {
                                                                           alert('Erro ao fechar caixa');
                                                                       }
                                                                   }
                                                               }}
                                                           >
                                                               <i className="fa fa-lock"/>
                                                           </button>
                                                       ) : (
                                                           <button
                                                               type="button"
                                                               className="btn-action btnstop"
                                                               title="Reabrir Caixa"
                                                               onClick={async () => {
                                                                   try {
                                                                       await api.post(`/api/financeiro/caixa/${caixaRow.id}/abrir`);
                                                                       alert('Caixa reaberto com sucesso');
                                                                       q.refetch();
                                                                   } catch (e) {
                                                                       alert('Erro ao reabrir caixa');
                                                                   }
                                                               }}
                                                           >
                                                               <i className="fa fa-unlock"/>
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
                                                            <>
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
                                                                        <th>Ações</th>
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
                                                                            <td>
                                                                                <div className="row-actions-menu">
                                                                                    {shouldShowExcluir() && (
                                                                                        <button
                                                            type="button"
                                                            className="btn-action btnred"
                                                            title="Excluir movimentação do caixa"
                                                            onClick={() => handleExcluirMovimentacao(mov)}
                                                        >
                                                            <i className="fa fa-times"/>
                                                        </button>
                                                                                    )}
                                                                                    {shouldShowSegundaViaPagamento(mov.tipoMovimento) && (
                                                                                        <button
                                                            type="button"
                                                            className="btn-action btnstop"
                                                            title="Segunda Via Pagamento"
                                                            onClick={() => handleSegundaViaPagamento(mov)}
                                                        >
                                                            <i className="fa fa-print"/>
                                                        </button>
                                                                                    )}
                                                                                    {shouldShowSegundaViaSangria(mov.tipoMovimento) && (
                                                                                        <button
                                                            type="button"
                                                            className="btn-action btngreen"
                                                            title="Segunda Via Sangria"
                                                            onClick={() => handleSegundaViaSangria(mov)}
                                                        >
                                                            <i className="fa fa-print"/>
                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    </tbody>
                                                                </table>
                                                                <div className="caixa-totals-actions">
                                                                    <div className="caixa-totals">
{(() => {
                                                                             const totals = calculateTotals(movs);
                                                                             const fundoCaixa = Number(caixaRow.fundoCaixa) || 0;
                                                                             const totalDinheiroCaixa = totals.totalDinheiro + fundoCaixa;
                                                                             return (
                                                                                <table className="totals-table">
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
                                                                                        <td>{formatCurrency(fundoCaixa)}</td>
                                                                                        <td>{formatCurrency(totals.totalDinheiro)}</td>
                                                                                        <td>{formatCurrency(totals.totalCheque)}</td>
                                                                                        <td>{formatCurrency(totals.totalCartao)}</td>
                                                                                        <td>{formatCurrency(totals.totalBoleto)}</td>
                                                                                        <td>{formatCurrency(totals.totalTransferencia)}</td>
                                                                                        <td>{formatCurrency(totals.totalDeposito)}</td>
                                                                                        <td>{formatCurrency(totals.totalSangria)}</td>
                                                                                        <td>{formatCurrency(totals.totalValor)}</td>
                                                                                        <td>{formatCurrency(totals.totalDesconto)}</td>
                                                                                        <td>{formatCurrency(totals.totalJurosMulta)}</td>
                                                                                        <td>{formatCurrency(totals.totalValorPagar)}</td>
                                                                                        <td>{formatCurrency(totalDinheiroCaixa)}</td>
                                                                                    </tr>
                                                                                    </tbody>
</table>
                                                                              );
                                                                          })()}
                                                               </div>
                                                           </div>
                                                           </>
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
                                        {loadingTotais[fluxoCaixaDialog.caixa.id] ? (
                                            <tr>
                                                <td colSpan={13} style={{textAlign: 'center'}}>Carregando totais...</td>
                                            </tr>
                                        ) : totaisCaixa[fluxoCaixaDialog.caixa.id] ? (
                                            <>
                                            <tr>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].fundoCaixa)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalDinheiro)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalCheque)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalCartao)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalBoleto)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalTransferencia)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalDeposito)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalSangria)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalValor)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalDesconto)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalMultaJuros)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].valorTotal)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].valorTotalCaixa)}</td>
                                            </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td>{formatCurrency(fluxoCaixaDialog.caixa.fundoCaixa)}</td>
                                                <td colSpan={12} style={{textAlign: 'center', color: '#666'}}>Totais calculados no servidor (não disponível)</td>
                                            </tr>
                                        )}
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
