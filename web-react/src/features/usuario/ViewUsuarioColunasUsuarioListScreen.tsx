import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewUsuarioColunasUsuarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Usuario</h1><DataTable path="/api/view/usuario/colunasUsuario"/></main>
    </PermissionGate>
}
