import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewRelatoriosListDashboardListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Dashboard</h1><DataTable path="/api/view/relatorios/listDashboard"/></main>
    </PermissionGate>
}