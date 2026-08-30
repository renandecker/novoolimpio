import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCoordenadorColunasAdminListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Admin</h1><DataTable path="/api/view/coordenador/colunasAdmin"/></main>
    </PermissionGate>
}
