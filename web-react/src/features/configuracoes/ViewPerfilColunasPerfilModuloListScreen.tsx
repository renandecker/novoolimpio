import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewPerfilColunasPerfilModuloListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Perfil Modulo</h1><DataTable path="/api/view/perfil/colunasPerfilModulo"/></main>
    </PermissionGate>
}
