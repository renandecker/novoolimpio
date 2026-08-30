import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewModuloColunasModuloListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Modulo</h1><DataTable path="/api/view/modulo/colunasModulo"/></main>
    </PermissionGate>
}
