import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoAgendaFormTipoAgendaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Agenda</h1><DataTable path="/api/view/tipoAgenda/formTipoAgenda"/></main>
    </PermissionGate>
}
