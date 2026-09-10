import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewResultadoListResultadoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Resultado</h1><DataTable path="/api/view/resultado/listResultado"/></main>
    </PermissionGate>
}
