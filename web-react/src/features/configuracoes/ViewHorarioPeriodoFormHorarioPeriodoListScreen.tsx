import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewHorarioPeriodoFormHorarioPeriodoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Horario Periodo</h1><DataTable path="/api/view/horarioPeriodo/formHorarioPeriodo"/></main>
    </PermissionGate>
}