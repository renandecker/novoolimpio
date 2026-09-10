import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewMatriculaListRematriculaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Rematricula</h1><DataTable path="/api/view/matricula/listRematricula"/></main>
    </PermissionGate>
}
