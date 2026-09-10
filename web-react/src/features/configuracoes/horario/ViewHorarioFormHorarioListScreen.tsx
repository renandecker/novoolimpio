import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewHorarioFormHorarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Horario</h1><DataTable path="/api/view/horario/formHorario"/></main>
    </PermissionGate>
}
