import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewRelatoriosListDashboardListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Dashboard</h1><DataTable path="/api/view/relatorios/listDashboard"/></main>
    </PermissionGate>
}
