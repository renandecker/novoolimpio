import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewEstadoListEstadoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Estado</h1><DataTable path="/api/view/estado/listEstado"/></main>
    </PermissionGate>
}
