import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewBandeiraListBandeiraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Bandeira</h1><DataTable path="/api/view/bandeira/listBandeira"/></main>
    </PermissionGate>
}