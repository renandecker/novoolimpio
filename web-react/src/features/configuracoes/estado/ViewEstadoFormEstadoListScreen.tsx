import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewEstadoFormEstadoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Estado</h1><DataTable path="/api/view/estado/formEstado"/></main>
    </PermissionGate>
}
