import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewHorarioListHorarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Horario</h1><DataTable path="/api/view/horario/listHorario"/></main>
    </PermissionGate>
}
