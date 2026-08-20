import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewRelatoriosColunasDashboardListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Dashboard</h1><DataTable path="/api/view/relatorios/colunasDashboard"/></main>
    </PermissionGate>
}