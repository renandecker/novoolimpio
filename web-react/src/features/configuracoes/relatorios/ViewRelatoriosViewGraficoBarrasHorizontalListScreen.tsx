import {useState, useEffect} from 'react';
import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';
import {ReportFilters} from '../../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper} from '../../../shared/types/types';
import {api} from '../../../shared/services/api';

export default function ViewRelatoriosViewGraficoBarrasHorizontalListScreen() {
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewGraficoBarrasHorizontal`);
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiltros();
    }, []);

    const handleFiltersChange = (newFiltros: FiltroRelatorioWrapper[]) => {
        setFiltros(newFiltros);
    };

    const handleApplyFilters = () => {
        console.log('Aplicar filtros do gráfico de barras horizontal');
    };

    if (loading) {
        return <PermissionGate permission="READ"><main><h1>View Grafico Barras Horizontal</h1><div>Carregando...</div></main></PermissionGate>;
    }

    return <PermissionGate permission="READ">
        <main>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h1>View Grafico Barras Horizontal</h1>
            </div>
            <ReportFilters filtros={filtros} onFiltersChange={handleFiltersChange} onApplyFilters={handleApplyFilters} />
            <DataTable path="/api/relatorios/grafico"/>
        </main>
    </PermissionGate>
}
