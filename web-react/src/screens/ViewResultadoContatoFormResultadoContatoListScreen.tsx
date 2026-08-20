import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewResultadoContatoFormResultadoContatoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Resultado Contato</h1><DataTable path="/api/view/resultadoContato/formResultadoContato"/></main>
    </PermissionGate>
}