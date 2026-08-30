import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewGrauFormGrauListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Grau</h1><DataTable path="/api/view/grau/formGrau"/></main>
    </PermissionGate>
}
