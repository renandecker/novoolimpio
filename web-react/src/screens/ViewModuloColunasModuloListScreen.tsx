import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewModuloColunasModuloListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Modulo</h1><DataTable path="/api/view/modulo/colunasModulo"/></main>
    </PermissionGate>
}