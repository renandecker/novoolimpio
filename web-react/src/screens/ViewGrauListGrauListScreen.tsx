import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewGrauListGrauListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Grau</h1><DataTable path="/api/view/grau/listGrau"/></main>
    </PermissionGate>
}