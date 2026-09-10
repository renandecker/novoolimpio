import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTurnoFormTurnoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Turno</h1><DataTable path="/api/view/turno/formTurno"/></main>
    </PermissionGate>
}
