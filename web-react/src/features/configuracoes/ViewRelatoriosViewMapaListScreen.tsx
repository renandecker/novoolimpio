import {useState, useEffect} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {ReportFilters} from '../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper} from '../../shared/types/types';
import {api} from '../../shared/services/api';

export default function ViewRelatoriosViewMapaListScreen() {
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewMapa`);
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
        console.log('Aplicar filtros do mapa');
    };

    if (loading) {
        return <main><h1>View Mapa</h1><div>Carregando...</div></main>;
    }

    return <PermissionGate permission="READ">
        <main>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h1>View Mapa</h1>
            </div>
            <ReportFilters filtros={filtros} onFiltersChange={handleFiltersChange} onApplyFilters={handleApplyFilters} />
            <DataTable path="/api/view/relatorios/viewMapa"/>
        </main>
    </PermissionGate>
}
