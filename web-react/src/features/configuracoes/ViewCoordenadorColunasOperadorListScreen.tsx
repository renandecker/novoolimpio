import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCoordenadorColunasOperadorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Operador</h1><DataTable path="/api/view/coordenador/colunasOperador"/></main>
    </PermissionGate>
}
