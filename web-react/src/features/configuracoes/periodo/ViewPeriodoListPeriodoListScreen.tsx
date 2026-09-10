import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewPeriodoListPeriodoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Periodo</h1><DataTable path="/api/view/periodo/listPeriodo"/></main>
    </PermissionGate>
}
