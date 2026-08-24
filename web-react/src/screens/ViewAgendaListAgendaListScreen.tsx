import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewAgendaListAgendaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Agenda</h1><DataTable path="/api/basico/agenda"/></main>
    </PermissionGate>
}