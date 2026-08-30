import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCoordenadorColunasAdminListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Admin</h1><DataTable path="/api/view/coordenador/colunasAdmin"/></main>
    </PermissionGate>
}