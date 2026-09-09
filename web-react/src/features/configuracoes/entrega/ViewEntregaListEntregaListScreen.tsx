import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewEntregaListEntregaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Entrega</h1><DataTable path="/api/view/entrega/listEntrega"/></main>
    </PermissionGate>
}
