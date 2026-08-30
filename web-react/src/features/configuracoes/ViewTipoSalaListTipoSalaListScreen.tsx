import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoSalaListTipoSalaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Sala</h1><DataTable path="/api/view/tipoSala/listTipoSala"/></main>
    </PermissionGate>
}
