import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTurnoListTurnoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Turno</h1><DataTable path="/api/view/turno/listTurno"/></main>
    </PermissionGate>
}
