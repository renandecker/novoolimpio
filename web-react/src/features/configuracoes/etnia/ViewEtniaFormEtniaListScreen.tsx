import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewEtniaFormEtniaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Etnia</h1><DataTable path="/api/view/etnia/formEtnia"/></main>
    </PermissionGate>
}
