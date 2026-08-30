import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewEntregaFormEntregaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Entrega</h1><DataTable path="/api/view/entrega/formEntrega"/></main>
    </PermissionGate>
}
