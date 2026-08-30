import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewPerfilColunasPerfilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Perfil</h1><DataTable path="/api/view/perfil/colunasPerfil"/></main>
    </PermissionGate>
}
