import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTurnoTrabalhoListTurnoTrabalhoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Turno Trabalho</h1><DataTable path="/api/view/turnoTrabalho/listTurnoTrabalho"/></main>
    </PermissionGate>
}