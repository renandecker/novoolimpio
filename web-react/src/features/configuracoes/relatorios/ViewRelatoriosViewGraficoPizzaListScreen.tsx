import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../../../shared/services/permissions';
import {ReportFilters} from '../../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper} from '../../../shared/types/types';
import {api} from '../../../shared/services/api';
import {abrirRelatorio} from '../../relatorios/relatorios';
import GraficoChart from './GraficoChart';
import '../ReportView.css';

export default function ViewRelatoriosViewGraficoPizzaListScreen() {
    const {id} = useParams<{ id: string }>();
    const graficoId = Number(id);
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loadingFiltros, setLoadingFiltros] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewGraficoPizza`, {
                    params: { graficoId }
                });
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoadingFiltros(false);
            }
        };
        fetchFiltros();
    }, [graficoId]);

    const report = useQuery({
        queryKey: ['relatorio-grafico-pizza', graficoId],
        queryFn: () => abrirRelatorio('PIZZA', graficoId),
        enabled: Number.isInteger(graficoId) && graficoId > 0,
    });

    const handleFiltersChange = (newFiltros: FiltroRelatorioWrapper[]) => {
        setFiltros(newFiltros);
    };

    const handleApplyFilters = () => {
        report.refetch();
    };

    const dadosGrafico = {
        linhas: (report.data?.dados && 'linhas' in report.data.dados ? report.data.dados.linhas : []) as import('../../relatorios/relatorios').LinhaGrafico[],
        linhasCombinado: (report.data?.dados && 'linhasCombinado' in report.data.dados ? report.data.dados.linhasCombinado : []) as import('../../relatorios/relatorios').LinhaGrafico[],
        exibirPercentual: (report.data?.dados && 'exibirPercentual' in report.data.dados ? report.data.dados.exibirPercentual : false) as boolean,
        exibirLegenda: (report.data?.dados && 'exibirLegenda' in report.data.dados ? report.data.dados.exibirLegenda : true) as boolean,
        exibirValor: (report.data?.dados && 'exibirValor' in report.data.dados ? report.data.dados.exibirValor : false) as boolean,
        valorAcumulado: (report.data?.dados && 'valorAcumulado' in report.data.dados ? report.data.dados.valorAcumulado : false) as boolean,
        posicao: (report.data?.dados && 'posicao' in report.data.dados ? report.data.dados.posicao : '') as string,
    };

    const nomeRelatorio = report.data?.nome || 'Gráfico Pizza';

    if (loadingFiltros || report.isLoading) {
        return (
            <PermissionGate permission="READ">
                <main className="report-view">
                    <div className="report-view-header">
                        <div className="report-view-header-text">
                            <span className="report-view-type">Gráfico</span>
                            <h1>Carregando...</h1>
                        </div>
                    </div>
                </main>
            </PermissionGate>
        );
    }

    if (report.isError || !report.data) {
        return (
            <PermissionGate permission="READ">
                <main className="report-view">
                    <div className="report-view-header">
                        <div className="report-view-header-text">
                            <span className="report-view-type">Gráfico</span>
                            <h1>Relatório indisponível</h1>
                        </div>
                    </div>
                </main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main className="report-view">
                <div className="report-view-header">
                    <div className="report-view-header-text">
                        <span className="report-view-type">Gráfico Pizza</span>
                        <h1>{nomeRelatorio}</h1>
                    </div>
                </div>
                <div className="report-view-content">
                    <ReportFilters filtros={filtros} onFiltersChange={handleFiltersChange} onApplyFilters={handleApplyFilters} />
                    <GraficoChart
                        tipo="PIZZA"
                        linhas={dadosGrafico.linhas}
                        linhasCombinado={dadosGrafico.linhasCombinado}
                        exibirLegenda={dadosGrafico.exibirLegenda}
                        exibirValor={dadosGrafico.exibirValor}
                        exibirPercentual={dadosGrafico.exibirPercentual}
                        valorAcumulado={dadosGrafico.valorAcumulado}
                        posicao={dadosGrafico.posicao}
                    />
                    <dl className="report-details">
                        {report.data.configuracao && Object.entries(report.data.configuracao)
                            .filter(([key]) => key !== 'id' && !key.startsWith('todos') && !Array.isArray(report.data.configuracao[key]) && typeof report.data.configuracao[key] !== 'object')
                            .map(([key, value]) => (
                                <div key={key}>
                                    <dt>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</dt>
                                    <dd>{value == null ? '—' : String(value)}</dd>
                                </div>
                            ))}
                    </dl>
                </div>
            </main>
        </PermissionGate>
    );
}