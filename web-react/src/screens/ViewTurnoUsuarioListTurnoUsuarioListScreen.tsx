import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTurnoUsuarioListTurnoUsuarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Turno Usuario</h1><DataTable path="/api/view/turnoUsuario/listTurnoUsuario"/></main>
    </PermissionGate>
}