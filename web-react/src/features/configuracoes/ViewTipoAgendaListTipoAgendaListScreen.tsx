import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoAgendaListTipoAgendaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Agenda</h1><DataTable path="/api/view/tipoAgenda/listTipoAgenda"/></main>
    </PermissionGate>
}
