import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewHorarioPeriodoListHorarioPeriodoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Horario Periodo</h1><DataTable path="/api/view/horarioPeriodo/listHorarioPeriodo"/></main>
    </PermissionGate>
}
