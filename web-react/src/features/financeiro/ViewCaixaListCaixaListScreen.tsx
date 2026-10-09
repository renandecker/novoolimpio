import {useState, useMemo} from 'react';
import {PermissionGate, useCurrentOutcome} from '../../shared/services/permissions';
import {api} from '../../shared/services/api';
import {useModulePaged} from '../../shared/hooks/useModulePaged';
import type {ApiItem} from '../../shared/types/index';
import type {SearchFilterRequest} from '../../shared/types/types';
import {legacyClassName} from '../../shared/components/DataTable';
import {ModuleFilter} from '../../shared/components/ModuleFilter';
import {swalConfirm} from '../../shared/components/swal';

const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;

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

const toMovimentacao = (raw: Record<string, unknown>): Movimentacao => {
    const movimentoId = raw.movimentoId != null ? Number(raw.movimentoId) : 0;
    const tipoMovimento = movimentoId === 3 ? 'SANGRIA' : (movimentoId === 2 ? 'SAIDA' : 'ENTRADA');
    const valor = Number(raw.valor) || 0;
    const desconto = Number(raw.desconto) || 0;
    const multaJuros = Number(raw.multaJuros) || 0;
    const valorTroco = Number(raw.valorTroco) || 0;
    return {
        id: Number(raw.id) || 0,
        parcelaId: raw.parcelaId != null ? Number(raw.parcelaId) : 0,
        contratoId: raw.contratoId != null ? Number(raw.contratoId) : (raw.caixaId != null ? Number(raw.caixaId) : 0),
        aluno: String(raw.aluno ?? raw.historico ?? ''),
        parcelaSequencia: raw.parcelaSequencia != null ? Number(raw.parcelaSequencia) : (raw.parcelaId != null ? Number(raw.parcelaId) : 0),
        dataMovimento: String(raw.dataMovimento ?? ''),
        vencimento: raw.vencimento != null ? String(raw.vencimento) : '',
        formaPagamento: raw.tipoPagamento != null ? String(raw.tipoPagamento) : '',
        valor,
        desconto,
        multaJuros,
        troco: valorTroco,
        total: valor - valorTroco,
        tipoMovimento,
    };
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

type CaixaTotais = {
    caixaId?: number;
    totalFundoCaixa: number;
    totalDinheiro: number;
    totalCheque: number;
    totalCartao: number;
    totalBoleto: number;
    totalTransferencia: number;
    totalDeposito: number;
    totalSangria: number;
    totalValor: number;
    totalDesconto: number;
    totalJurosMulta: number;
    totalValorPagar: number;
    totalDinheiroCaixa: number;
};

const toTotais = (raw: Record<string, unknown>, fundoFallback: number): CaixaTotais => ({
    caixaId: raw.caixaId != null ? Number(raw.caixaId) : undefined,
    totalFundoCaixa: Number(raw.totalFundoCaixa ?? fundoFallback) || 0,
    totalDinheiro: Number(raw.totalDinheiro) || 0,
    totalCheque: Number(raw.totalCheque) || 0,
    totalCartao: Number(raw.totalCartao) || 0,
    totalBoleto: Number(raw.totalBoleto) || 0,
    totalTransferencia: Number(raw.totalTransferencia) || 0,
    totalDeposito: Number(raw.totalDeposito) || 0,
    totalSangria: Number(raw.totalSangria) || 0,
    totalValor: Number(raw.totalValor) || 0,
    totalDesconto: Number(raw.totalDesconto) || 0,
    totalJurosMulta: Number(raw.totalJurosMulta) || 0,
    totalValorPagar: Number(raw.totalValorPagar) || 0,
    totalDinheiroCaixa: Number(raw.totalDinheiroCaixa) || 0,
});

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
    {key: 'usuario_login', label: 'Usuário', render: (item: ApiItem) => String(asRecord(item).usuario_login ?? asRecord(item).usuario_descricao ?? asRecord(item).usuario ?? '')},
    {key: 'unidade_sucinto', label: 'Unidade', render: (item: ApiItem) => String(asRecord(item).unidade_sucinto ?? asRecord(item).unidade_nome ?? asRecord(item).unidade ?? '')},
    {key: 'data', label: 'Data', render: (item: ApiItem) => formatDateTime(asRecord(item).data)},
    {key: 'data_fechamento', label: 'Data Fechamento', render: (item: ApiItem) => asRecord(item).data_fechamento ? formatDateTime(asRecord(item).data_fechamento) : ''},
    {key: 'fundo_caixa', label: 'Fundo de Caixa', render: (item: ApiItem) => formatCurrency(asRecord(item).fundo_caixa)},
];

export default function ViewCaixaListCaixaListScreen() {
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [movimentacoes, setMovimentacoes] = useState<Record<number, Movimentacao[]>>({});
    const [loadingMovimentacoes, setLoadingMovimentacoes] = useState<Record<number, boolean>>({});
    const [fluxoCaixaDialog, setFluxoCaixaDialog] = useState<{open: boolean; caixa: CaixaRow | null}>({open: false, caixa: null});

    const [filterParams, setFilterParams] = useState<SearchFilterRequest>({filters: {}});

    const q = useModulePaged('/api/financeiro/caixa', 0, 10, undefined, filterParams);
    const all = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);
    const [page, setPage] = useState(0);

    const [totaisCaixa, setTotaisCaixa] = useState<Record<number, CaixaTotais>>({});
    const [loadingTotais, setLoadingTotais] = useState<Record<number, boolean>>({});
    const [erroTotais, setErroTotais] = useState<Record<number, string>>({});

    const loadTotais = async (row: CaixaRow): Promise<CaixaTotais | null> => {
        if (totaisCaixa[row.id] || loadingTotais[row.id]) return totaisCaixa[row.id] ?? null;
        setLoadingTotais(prev => ({...prev, [row.id]: true}));
        setErroTotais(prev => {
            const next = {...prev};
            delete next[row.id];
            return next;
        });
        try {
            // Totais sempre via API (caixa aberto ou fechado) — backend calcula por forma de pagamento.
            const {data} = await api.get<Record<string, unknown>>(`/api/financeiro/caixa/${row.id}/totais-fechamento`);
            const totais = toTotais(data ?? {}, Number(row.fundoCaixa) || 0);
            setTotaisCaixa(prev => ({...prev, [row.id]: totais}));
            return totais;
        } catch (e: any) {
            console.error('Erro ao carregar totais:', e?.response?.data ?? e);
            setErroTotais(prev => ({...prev, [row.id]: 'Falha ao carregar totais da API'}));
            return null;
        } finally {
            setLoadingTotais(prev => ({...prev, [row.id]: false}));
        }
    };

    const toggleExpand = async (row: CaixaRow) => {
        const id = row.id;
        const isOpen = expandedRows[id];
        const newExpanded = {...expandedRows, [id]: !isOpen};
        setExpandedRows(newExpanded);

        if (!isOpen && !movimentacoes[id] && !loadingMovimentacoes[id]) {
            setLoadingMovimentacoes(prev => ({...prev, [id]: true}));
            try {
                const {data} = await api.get<Record<string, unknown>[]>(`/api/financeiro/caixa/${id}/movimentacoes`);
                setMovimentacoes(prev => ({...prev, [id]: (data ?? []).map(toMovimentacao)}));
            } catch (e) {
                console.error('Erro ao carregar movimentações:', e);
                setMovimentacoes(prev => ({...prev, [id]: []}));
            } finally {
                setLoadingMovimentacoes(prev => ({...prev, [id]: false}));
            }
        }
        // Totais do detalhe expandido sempre via API.
        if (!isOpen) {
            void loadTotais(row);
        }
    };

const openFluxoCaixa = async (row: CaixaRow) => {
        setFluxoCaixaDialog({open: true, caixa: row});
        let movs = movimentacoes[row.id];
        if (!movs && !loadingMovimentacoes[row.id]) {
            setLoadingMovimentacoes(prev => ({...prev, [row.id]: true}));
            try {
                const {data} = await api.get<Record<string, unknown>[]>(`/api/financeiro/caixa/${row.id}/movimentacoes`);
                movs = (data ?? []).map(toMovimentacao);
                setMovimentacoes(prev => ({...prev, [row.id]: movs}));
            } catch (e) {
                console.error('Erro ao carregar movimentações:', e);
                movs = [];
                setMovimentacoes(prev => ({...prev, [row.id]: []}));
            } finally {
                setLoadingMovimentacoes(prev => ({...prev, [row.id]: false}));
            }
        }
        await loadTotais(row);
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
        if (await swalConfirm(`Excluir movimentação ${mov.id}?`, {title: 'Excluir movimentação', confirmText: 'Excluir', danger: true})) {
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

      const handleImprimir = async (caixaId: number) => {
          try {
              const response = await api.post(`/api/financeiro/caixa/${caixaId}/imprimir`, undefined, {
                  responseType: 'blob',
                  headers: {Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
              });
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `relatorio-caixa-${caixaId}.docx`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              q.refetch();
          } catch (e) {
              console.error('Erro ao imprimir:', e);
              alert('Erro ao imprimir');
          }
      };

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
            else if (forma.includes('TRANSFER') || forma.includes('TRANFER') || forma.includes('PIX')) totals.totalTransferencia += total;
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
                        <ModuleFilter columns={COLUMNS} value={filterParams} onChange={setFilterParams}/>
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
                                                         className="btn-action btnblack"
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
                                                           onClick={() => handleImprimir(caixaRow.id)}
                                                       >
                                                           <i className="fa fa-print"/>
                                                       </button>
                                                       {!caixaRow.dataFechamento ? (
                                                           <button
                                                               type="button"
                                                               className="btn-action btnred"
                                                               title="Fechar Caixa"
                                                               onClick={async () => {
                                                                   if (await swalConfirm('Tem certeza que deseja fechar este caixa?', {title: 'Fechar caixa', confirmText: 'Fechar caixa', danger: true})) {
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
                                                        ) : (
                                                            <>
                                                                {movs.length === 0 ? (
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
                                                                )}
                                                                <div className="caixa-totals-actions">
                                                                    <div className="caixa-totals">
{(() => {
                                                                             const apiTotais = totaisCaixa[caixaId];
                                                                             const isLoadingTotais = loadingTotais[caixaId];
                                                                             if (isLoadingTotais && !apiTotais) {
                                                                                 return <p>Carregando totais...</p>;
                                                                             }
                                                                             const totals = apiTotais ?? (() => {
                                                                                 const t = calculateTotals(movs);
                                                                                 const fundo = Number(caixaRow.fundoCaixa) || 0;
                                                                                 return {
                                                                                     totalFundoCaixa: fundo,
                                                                                     totalDinheiro: t.totalDinheiro,
                                                                                     totalCheque: t.totalCheque,
                                                                                     totalCartao: t.totalCartao,
                                                                                     totalBoleto: t.totalBoleto,
                                                                                     totalTransferencia: t.totalTransferencia,
                                                                                     totalDeposito: t.totalDeposito,
                                                                                     totalSangria: t.totalSangria,
                                                                                     totalValor: t.totalValor,
                                                                                     totalDesconto: t.totalDesconto,
                                                                                     totalJurosMulta: t.totalJurosMulta,
                                                                                     totalValorPagar: t.totalValorPagar,
                                                                                     totalDinheiroCaixa: t.totalDinheiro + fundo,
                                                                                 };
                                                                             })();
                                                                             return (
                                                                                <>
                                                                                {erroTotais[caixaId] && !apiTotais ? (
                                                                                    <p style={{color: '#a00'}}>Totais da API indisponíveis — exibindo cálculo local.{' '}
                                                                                        <button type="button" className="btn-form-back" style={{marginLeft: 8}} onClick={() => loadTotais(caixaRow)}>Tentar novamente</button>
                                                                                    </p>
                                                                                ) : null}
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
                                                                                        <td>{formatCurrency(totals.totalFundoCaixa)}</td>
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
                                                                                        <td>{formatCurrency(totals.totalDinheiroCaixa)}</td>
                                                                                    </tr>
                                                                                    </tbody>
</table>
                                                                                </>
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
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalFundoCaixa)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalDinheiro)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalCheque)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalCartao)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalBoleto)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalTransferencia)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalDeposito)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalSangria)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalValor)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalDesconto)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalJurosMulta)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalValorPagar)}</td>
                                                <td>{formatCurrency(totaisCaixa[fluxoCaixaDialog.caixa.id].totalDinheiroCaixa)}</td>
                                            </tr>
                                            </>
                                        ) : (() => {
                                            const fallbackMovs = movimentacoes[fluxoCaixaDialog.caixa.id] ?? [];
                                            const t = calculateTotals(fallbackMovs);
                                            const fundo = Number(fluxoCaixaDialog.caixa.fundoCaixa) || 0;
                                            return (
                                            <tr>
                                                <td>{formatCurrency(fundo)}</td>
                                                <td>{formatCurrency(t.totalDinheiro)}</td>
                                                <td>{formatCurrency(t.totalCheque)}</td>
                                                <td>{formatCurrency(t.totalCartao)}</td>
                                                <td>{formatCurrency(t.totalBoleto)}</td>
                                                <td>{formatCurrency(t.totalTransferencia)}</td>
                                                <td>{formatCurrency(t.totalDeposito)}</td>
                                                <td>{formatCurrency(t.totalSangria)}</td>
                                                <td>{formatCurrency(t.totalValor)}</td>
                                                <td>{formatCurrency(t.totalDesconto)}</td>
                                                <td>{formatCurrency(t.totalJurosMulta)}</td>
                                                <td>{formatCurrency(t.totalValorPagar)}</td>
                                                <td>{formatCurrency(t.totalDinheiro + fundo)}</td>
                                            </tr>
                                            );
                                        })()}
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
