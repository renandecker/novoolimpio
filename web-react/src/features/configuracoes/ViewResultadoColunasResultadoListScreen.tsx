import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewResultadoColunasResultadoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Resultado</h1><DataTable path="/api/view/resultado/colunasResultado"/></main>
    </PermissionGate>
}
