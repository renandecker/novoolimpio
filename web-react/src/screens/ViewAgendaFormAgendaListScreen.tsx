import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewAgendaFormAgendaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Agenda</h1><DataTable path="/api/view/agenda/formAgenda"/></main>
    </PermissionGate>
}