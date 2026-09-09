import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewSalaListSalaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Sala</h1><DataTable path="/api/view/sala/listSala"/></main>
    </PermissionGate>
}
