import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoSalaFormTipoSalaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Sala</h1><DataTable path="/api/view/tipoSala/formTipoSala"/></main>
    </PermissionGate>
}
