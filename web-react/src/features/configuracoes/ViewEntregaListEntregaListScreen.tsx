import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewEntregaListEntregaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Entrega</h1><DataTable path="/api/view/entrega/listEntrega"/></main>
    </PermissionGate>
}