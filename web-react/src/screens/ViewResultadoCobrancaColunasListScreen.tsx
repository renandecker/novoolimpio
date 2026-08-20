import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewResultadoCobrancaColunasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas</h1><DataTable path="/api/view/resultadoCobranca/colunas"/></main>
    </PermissionGate>
}