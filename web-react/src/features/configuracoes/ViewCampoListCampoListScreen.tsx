import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCampoListCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Campo</h1><DataTable path="/api/view/campo/listCampo"/></main>
    </PermissionGate>
}
