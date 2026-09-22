import {useState, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../../../shared/services/permissions';
import {ReportFilters} from '../../../shared/components/ReportFilters';
import HelpOverlay from '../../../shared/components/HelpOverlay';
import type {FiltroRelatorioWrapper} from '../../../shared/types/types';
import {api} from '../../../shared/services/api';
import {abrirRelatorio, type MapaPontosResponse} from '../../relatorios/relatorios';
import MapaView from './MapaView';
import '../ReportView.css';

export default function ViewRelatoriosViewMapaListScreen() {
    const [searchParams] = useSearchParams();
    const mapaId = Number(searchParams.get('id'));
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loadingFiltros, setLoadingFiltros] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewMapa`, {
                    params: {mapaId}
                });
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoadingFiltros(false);
            }
        };
        fetchFiltros();
    }, [mapaId]);

    const report = useQuery({
        queryKey: ['relatorio-mapa', mapaId],
        queryFn: () => abrirRelatorio('MAPA', mapaId),
        enabled: Number.isInteger(mapaId) && mapaId > 0,
    });

    const handleFiltersChange = (newFiltros: FiltroRelatorioWrapper[]) => {
        setFiltros(newFiltros);
    };

    const handleApplyFilters = () => {
        console.log('Aplicar filtros do mapa - recarregar dados');
        report.refetch();
    };

    const nomeRelatorio = report.data?.nome || 'View Mapa';

    if (loadingFiltros || report.isLoading) {
        return <PermissionGate permission="READ"><main className="report-view"><div className="report-view-header"><div className="report-view-header-text"><span className="report-view-type">Mapa</span><h1>Carregando...</h1></div></div></main></PermissionGate>;
    }

    if (report.isError || !report.data) {
        return <PermissionGate permission="READ"><main className="report-view"><div className="report-view-header"><div className="report-view-header-text"><span className="report-view-type">Mapa</span><h1>Relatório indisponível</h1></div></div></main></PermissionGate>;
    }

    return <PermissionGate permission="READ">
        <main className="report-view">
            <div className="report-view-header">
                <div className="report-view-header-text">
                    <span className="report-view-type">Mapa</span>
                    <h1>{nomeRelatorio}</h1>
                </div>
                <div className="report-view-actions">
                    <HelpOverlay/>
                </div>
            </div>
            <div className="report-view-content">
                <ReportFilters filtros={filtros} onFiltersChange={handleFiltersChange} onApplyFilters={handleApplyFilters} />
                {report.data.tipo === 'MAPA' && report.data.dados ? (
                    <MapaView data={report.data.dados as MapaPontosResponse} />
                ) : (
                    <div className="report-result">
                        <p>Este relatório não é um mapa.</p>
                    </div>
                )}
            </div>
        </main>
    </PermissionGate>;
}