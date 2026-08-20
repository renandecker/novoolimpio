import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewResultadoContatoListResultadoContatoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Resultado Contato</h1><DataTable path="/api/view/resultadoContato/listResultadoContato"/></main>
    </PermissionGate>
}