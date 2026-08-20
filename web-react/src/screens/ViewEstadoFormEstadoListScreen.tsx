import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewEstadoFormEstadoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Estado</h1><DataTable path="/api/view/estado/formEstado"/></main>
    </PermissionGate>
}