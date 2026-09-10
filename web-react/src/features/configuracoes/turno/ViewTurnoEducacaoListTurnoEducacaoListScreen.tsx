import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTurnoEducacaoListTurnoEducacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Turno Educacao</h1><DataTable path="/api/view/turnoEducacao/listTurnoEducacao"/></main>
    </PermissionGate>
}
