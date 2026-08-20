import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewPerfilColunasPerfilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Perfil</h1><DataTable path="/api/view/perfil/colunasPerfil"/></main>
    </PermissionGate>
}