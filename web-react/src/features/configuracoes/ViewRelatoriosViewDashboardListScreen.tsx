import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewRelatoriosViewDashboardListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Dashboard</h1><DataTable path="/api/view/relatorios/viewDashboard"/></main>
    </PermissionGate>
}