import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTurnoEducacaoFormTurnoEducacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Turno Educacao</h1><DataTable path="/api/view/turnoEducacao/formTurnoEducacao"/></main>
    </PermissionGate>
}