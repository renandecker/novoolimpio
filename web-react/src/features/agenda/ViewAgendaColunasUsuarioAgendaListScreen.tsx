import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewAgendaColunasUsuarioAgendaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Usuario Agenda</h1><DataTable path="/api/view/agenda/colunasUsuarioAgenda"/></main>
    </PermissionGate>
}
