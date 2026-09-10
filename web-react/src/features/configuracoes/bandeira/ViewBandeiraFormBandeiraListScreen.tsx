import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewBandeiraFormBandeiraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Bandeira</h1><DataTable path="/api/view/bandeira/formBandeira"/></main>
    </PermissionGate>
}
