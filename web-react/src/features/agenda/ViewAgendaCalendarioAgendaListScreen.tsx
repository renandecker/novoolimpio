import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewAgendaCalendarioAgendaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Calendario Agenda</h1><DataTable path="/api/view/agenda/calendarioAgenda"/></main>
    </PermissionGate>
}
