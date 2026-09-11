import {useState, useEffect} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../../../shared/services/permissions';
import {ReportFilters} from '../../../shared/components/ReportFilters';
import HelpOverlay from '../../../shared/components/HelpOverlay';
import type {FiltroRelatorioWrapper} from '../../../shared/types/types';
import {api} from '../../../shared/services/api';
import {abrirRelatorio} from '../../relatorios/relatorios';
import '../ReportView.css';

export default function ViewRelatoriosViewTabelaListScreen() {
    const {id} = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const tabelaId = Number(id);
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loadingFiltros, setLoadingFiltros] = useState(true);
    const [page, setPage] = useState(0);
    const [fetchLimit, setFetchLimit] = useState(10);
    const [dataPage, setDataPage] = useState<{ colunas: string[]; linhas: Record<string, unknown>[]; totalElements: number; totalPages: number } | null>(null);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewTabela`, {
                    params: { tabelaId }
                });
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoadingFiltros(false);
            }
        };
        fetchFiltros();
    }, [tabelaId]);

    const report = useQuery({
        queryKey: ['relatorio-tabela', tabelaId],
        queryFn: () => abrirRelatorio('TABELA', tabelaId),
        enabled: Number.isInteger(tabelaId) && tabelaId > 0,
    });

    useEffect(() => {
        setPage(0);
        setDataPage(null);
    }, [tabelaId]);

    useEffect(() => {
        const dados = report.data?.dados;
        if (!dados || report.data?.tipo !== 'TABELA' || 'regras' in dados) {
            setDataPage(null);
            return;
        }
        const allRows = dados.linhas || [];
        const totalElements = allRows.length;
        const totalPages = Math.max(1, Math.ceil(totalElements / fetchLimit));
        const safePage = Math.min(page, totalPages - 1);
        const start = safePage * fetchLimit;
        const linhas = allRows.slice(start, start + fetchLimit);
        setDataPage({colunas: dados.colunas || [], linhas, totalElements, totalPages});
        if (page !== safePage) setPage(safePage);
    }, [report.data, page, fetchLimit]);

    const handleFiltersChange = (newFiltros: FiltroRelatorioWrapper[]) => {
        setFiltros(newFiltros);
    };

    const handleApplyFilters = () => {
        console.log('Aplicar filtros da tabela - recarregar dados');
        report.refetch();
    };

    const nomeRelatorio = report.data?.nome || 'View Tabela';

    if (loadingFiltros || report.isLoading) {
        return <PermissionGate permission="READ"><main className="report-view"><div className="report-view-header"><div className="report-view-header-text"><span className="report-view-type">Tabela</span><h1>Carregando...</h1></div></div></main></PermissionGate>;
    }

    if (report.isError || !report.data) {
        return <PermissionGate permission="READ"><main className="report-view"><div className="report-view-header"><div className="report-view-header-text"><span className="report-view-type">Tabela</span><h1>Relatório indisponível</h1></div></div></main></PermissionGate>;
    }

    return <PermissionGate permission="READ">
        <main className="report-view">
            <div className="report-view-header">
                <div className="report-view-header-text">
                    <span className="report-view-type">Tabela</span>
                    <h1>{nomeRelatorio}</h1>
                </div>
                <div className="report-view-actions">
                    <HelpOverlay/>
                </div>
            </div>
            <div className="report-view-content">
                <ReportFilters filtros={filtros} onFiltersChange={handleFiltersChange} onApplyFilters={handleApplyFilters} />
                {dataPage && (
                    <div className="report-result">
                        {dataPage.colunas.length === 0 ? (
                            <p>Este relatório ainda não possui colunas configuradas.</p>
                        ) : (
                            <>
                                <table>
                                    <thead>
                                    <tr>{dataPage.colunas.map((column) => <th key={column}>{column}</th>)}</tr>
                                    </thead>
                                    <tbody>{dataPage.linhas.length === 0 ? <tr>
                                        <td colSpan={dataPage.colunas.length}>Nenhum registro encontrado.</td>
                                    </tr> : dataPage.linhas.map((row, index) => <tr
                                        key={index}>{dataPage.colunas.map((column) => <td
                                        key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
                                </table>
                                {dataPage.totalElements > fetchLimit && (
                                    <div className="data-table-paginator" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 0'
                                    }}>
                                        <button onClick={() => setPage((p) => Math.max(0, p - 1))}
                                                disabled={page === 0}>Anterior
                                        </button>
                                        <span>Página {page + 1} de {dataPage.totalPages}</span>
                                        <button
                                            onClick={() => setPage((p) => Math.min(dataPage.totalPages - 1, p + 1))}
                                            disabled={page >= dataPage.totalPages - 1}>Próxima
                                        </button>
                                        <label>
                                            Registros por página
                                            <select value={fetchLimit} onChange={(e) => {
                                                setFetchLimit(Number(e.target.value));
                                                setPage(0);
                                            }}>
                                                {[10, 20, 50, 100].map((s) => <option key={s}
                                                                                   value={s}>{s}</option>)}
                                            </select>
                                        </label>
                                        <span>Total: {dataPage.totalElements}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                {!dataPage && report.data?.tipo === 'TABELA' && (
                    <div className="report-result">
                        <p>Nenhum registro encontrado.</p>
                    </div>
                )}
            </div>
        </main>
    </PermissionGate>
}
