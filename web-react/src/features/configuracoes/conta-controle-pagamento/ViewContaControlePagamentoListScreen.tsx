import {useState, useMemo, type ReactNode} from 'react';
import {PermissionGate, useCurrentOutcome} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';
import {useModulePaged} from '../../../shared/hooks/useModulePaged';
import type {ApiItem} from '../../../shared/types/index';
import type {SearchFilterRequest} from '../../../shared/types/types';
import {legacyClassName} from '../../../shared/components/DataTable';
import {ModuleFilter} from '../../../shared/components/ModuleFilter';
import BreadCrumb from '../../../shared/components/BreadCrumb';
import {swalConfirm} from '../../../shared/components/swal';

const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const formatCurrency = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
};

const formatPercent = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return `${num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} %`;
};

const isOverdue = (dataConta: unknown): boolean => {
    if (!dataConta) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vencimento = new Date(String(dataConta));
    return vencimento < today;
};

const COLUMNS = [
    {key: 'conta_unidade_sucinto', label: 'Unidade'},
    {key: 'conta_usuario_login', label: 'Usuário conta'},
    {key: 'dataConta', label: 'Data Vencimento', render: (item: ApiItem) => formatDate(asRecord(item).dataConta)},
    {key: 'conta_valor', label: 'Valor', render: (item: ApiItem) => formatCurrency(asRecord(item).conta_valor)},
    {key: 'conta_desconto', label: 'Desconto', render: (item: ApiItem) => formatPercent(asRecord(item).conta_desconto)},
    {key: 'conta_juros', label: 'Juros', render: (item: ApiItem) => formatPercent(asRecord(item).conta_juros)},
    {key: 'conta_multa', label: 'Multa', render: (item: ApiItem) => formatPercent(asRecord(item).conta_multa)},
];

type ControlePagamentoRow = {
    id: number;
    conta_unidade_sucinto: string;
    conta_usuario_login: string;
    dataConta: string;
    conta_valor: number;
    conta_desconto: number;
    conta_juros: number;
    conta_multa: number;
    dataAplicada: string | null;
    valorPagar: number;
};

export default function ViewContaControlePagamentoListScreen() {
    const outcome = useCurrentOutcome();
    const [filterParams, setFilterParams] = useState<SearchFilterRequest>({filters: {}});
    const [notice, setNotice] = useState<string>('');
    const [showCalcOverlay, setShowCalcOverlay] = useState<{open: boolean; item: ControlePagamentoRow | null}>({open: false, item: null});

    const q = useModulePaged('/api/view/conta/controlePagamento', 0, 10, undefined, filterParams);
    const all = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);
    const [page, setPage] = useState(0);

    const handleCalcularPagamento = async (item: ControlePagamentoRow) => {
        try {
            const response = await api.post(`/api/conta/controlePagamento/${item.id}/calcular`);
            const valorPagar = response.data.valorPagar ?? 0;
            setShowCalcOverlay({open: true, item: {...item, valorPagar}});
        } catch (error: any) {
            setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
        }
    };

    const handleAplicarPago = async (item: ControlePagamentoRow) => {
        if (!(await swalConfirm('Deseja aplicar como pago?', {title: 'Aplicar como pago', confirmText: 'Aplicar'}))) return;
        try {
            await api.post(`/api/conta/controlePagamento/${item.id}/aplicar-pago`);
            setNotice('Pagamento aplicado com sucesso');
            q.refetch();
        } catch (error: any) {
            setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
        }
    };

    const handleRemover = async (item: ControlePagamentoRow) => {
        if (!(await swalConfirm('Deseja realmente remover este controle de pagamento?', {title: 'Atenção!', confirmText: 'Remover', danger: true}))) return;
        try {
            await api.delete(`/api/conta/controlePagamento/${item.id}`);
            setNotice('Controle de pagamento removido com sucesso');
            q.refetch();
        } catch (error: any) {
            setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
        }
    };

    return (
            <PermissionGate permission="READ">
                <main>
                    <div className="page-header">
                        <div className="page-header-breadcrumb">
                            <BreadCrumb />
                        </div>
                        <div className="page-header-actions">
                            <ModuleFilter columns={COLUMNS} value={filterParams} onChange={setFilterParams}/>
                        </div>
                    </div>

                    <div className="list-panel">
                        <div className="data-table">
                            {q.isError ? (
                                <p>Erro ao carregar os controles de pagamento.</p>
                            ) : (
                                <table>
                                    <thead>
                                    <tr>
                                        {COLUMNS.map((column) => (
                                            <th key={column.key}>{column.label}</th>
                                        ))}
                                        <th className="col-actions">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {q.isLoading && all.length === 0 ? (
                                        <tr>
                                            <td colSpan={COLUMNS.length + 1}>Carregando...</td>
                                        </tr>
                                    ) : all.length === 0 ? (
                                        <tr>
                                            <td colSpan={COLUMNS.length + 1}>Nenhum registro encontrado.</td>
                                        </tr>
                                    ) : (
                                        all.map((item) => {
                                            const row = asRecord(item);
                                            const id = Number(row.id);
                                            const dataAplicada = row.dataAplicada;
                                            const overdue = isOverdue(row.dataConta);
                                            return (
                                                <tr key={id} style={{backgroundColor: overdue && !dataAplicada ? '#fff3cd' : undefined}}>
                                                    {COLUMNS.map((column) => {
                                                        const value = row[column.key];
                                                        let cellValue: ReactNode = String(value ?? '');
                                                        if (overdue && !dataAplicada && column.key === 'dataConta') {
                                                            cellValue = <span style={{color: '#C90000', fontWeight: 'bold'}}>{formatDate(value)}</span>;
                                                        }
                                                        return (
                                                            <td key={column.key}>
                                                                {column.render ? column.render(item) : cellValue}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="col-actions">
                                                        <div className="row-actions-menu">
                                                            <button
                                                                type="button"
                                                                className="btn-action btnblack"
                                                                title="Calcula pagamento"
                                                                onClick={() => handleCalcularPagamento(row as unknown as ControlePagamentoRow)}
                                                            >
                                                                <i className="fa fa-usd"/>
                                                            </button>
                                                            {!dataAplicada && (
                                                                <button
                                                                    type="button"
                                                                    className="btn-action btnstop"
                                                                    title="Aplicar pago"
                                                                    onClick={() => handleAplicarPago(row as unknown as ControlePagamentoRow)}
                                                                >
                                                                    <i className="fa fa-check"/>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <td colSpan={COLUMNS.length + 1} className="data-table-paginator">
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
                    </div>

                    {notice && <div className="data-table-notice global-notice">{notice}</div>}

                    {showCalcOverlay.open && showCalcOverlay.item && (
                        <div className="modal-overlay" onClick={() => setShowCalcOverlay({open: false, item: null})}>
                            <div className="modal form-modal" onClick={e => e.stopPropagation()} style={{maxWidth: '500px', width: '90%'}}>
                                <div className="div_form">
                                    <div className="form-title">Cálculo de Pagamento</div>
                                    <div className="table_form">
                                        <div className="form-grid">
                                            <label className="form-field" style={{gridColumn: 'span 2'}}>
                                                <span className="form-label">Valor a Pagar</span>
                                                <span style={{fontSize: '18px', fontWeight: 'bold', color: '#2e7d32'}}>
                                                    {formatCurrency(showCalcOverlay.item.valorPagar)}
                                                </span>
                                            </label>
                                        </div>
                                        <div className="form-footer" style={{marginTop: '16px', justifyContent: 'center'}}>
                                            <button type="button" className="btn-form-back" onClick={() => setShowCalcOverlay({open: false, item: null})}>
                                                Fechar
                                            </button>
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
