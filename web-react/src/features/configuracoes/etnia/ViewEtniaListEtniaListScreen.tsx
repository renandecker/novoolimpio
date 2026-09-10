import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewEtniaListEtniaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Etnia</h1><DataTable path="/api/view/etnia/listEtnia"/></main>
    </PermissionGate>
}
