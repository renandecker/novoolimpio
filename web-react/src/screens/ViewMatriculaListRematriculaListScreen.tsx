import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewMatriculaListRematriculaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Rematricula</h1><DataTable path="/api/view/matricula/listRematricula"/></main>
    </PermissionGate>
}