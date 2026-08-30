import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTurnoEducacaoFormTurnoEducacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Turno Educacao</h1><DataTable path="/api/view/turnoEducacao/formTurnoEducacao"/></main>
    </PermissionGate>
}
