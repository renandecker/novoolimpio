import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewPaisFormPaisListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Pais</h1><DataTable path="/api/view/pais/formPais"/></main>
    </PermissionGate>
}
