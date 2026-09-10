import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';
import {ReportFilters} from '../../../shared/components/ReportFilters';
import type {DataTableRowAction} from '../../../shared/components/DataTable';
import type {FiltroRelatorioWrapper} from '../../../shared/types/types';
import {api} from '../../../shared/services/api';

export default function ViewRelatoriosListTabelaListScreen() {
    const navigate = useNavigate();
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/listTabela`);
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiltros();
    }, []);

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'acessar',
            title: 'Acessar',
            icon: <i className="fa fa-external-link"/>,
            permission: 'EXECUTE',
            onClick: (item) => {
                navigate(`/view/relatorios/viewTabela/${item.id}`);
            },
        },
    ];

    const handleFiltersChange = (newFiltros: FiltroRelatorioWrapper[]) => {
        setFiltros(newFiltros);
    };

    const handleApplyFilters = () => {
        console.log('Aplicar filtros da tabela');
    };

    if (loading) {
        return <PermissionGate permission="READ"><main><h1>Tabela</h1><div>Carregando...</div></main></PermissionGate>;
    }

    return <PermissionGate permission="READ">
        <main>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h1>Tabela</h1>
            </div>
            <ReportFilters filtros={filtros} onFiltersChange={handleFiltersChange} onApplyFilters={handleApplyFilters} />
            <DataTable path="/api/view/relatorios/listTabela" extraRowActions={extraRowActions}/>
        </main>
    </PermissionGate>
}
