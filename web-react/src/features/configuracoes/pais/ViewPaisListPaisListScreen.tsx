import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewPaisListPaisListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Pais</h1><DataTable path="/api/view/pais/listPais"/></main>
    </PermissionGate>
}
