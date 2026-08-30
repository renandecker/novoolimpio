import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewHorarioListHorarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Horario</h1><DataTable path="/api/view/horario/listHorario"/></main>
    </PermissionGate>
}