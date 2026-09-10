import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewCargaFormCargaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Carga</h1><DataTable path="/api/view/carga/formCarga"/></main>
    </PermissionGate>
}
