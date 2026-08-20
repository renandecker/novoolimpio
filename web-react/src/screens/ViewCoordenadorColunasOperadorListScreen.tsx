import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCoordenadorColunasOperadorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Operador</h1><DataTable path="/api/view/coordenador/colunasOperador"/></main>
    </PermissionGate>
}