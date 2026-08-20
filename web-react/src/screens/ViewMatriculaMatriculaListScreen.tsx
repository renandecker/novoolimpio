import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewMatriculaMatriculaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Matricula</h1><DataTable path="/api/view/matricula/matricula"/></main>
    </PermissionGate>
}