import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewProspectoEditProspectoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Edit Prospecto</h1><DataTable path="/api/view/prospecto/editProspecto"/></main>
    </PermissionGate>
}
