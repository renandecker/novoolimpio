import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCorListCoresListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Cores</h1><DataTable path="/api/view/cor/listCores"/></main>
    </PermissionGate>
}
