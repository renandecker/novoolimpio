import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewAgendaCalendarioAgendaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Calendario Agenda</h1><DataTable path="/api/view/agenda/calendarioAgenda"/></main>
    </PermissionGate>
}