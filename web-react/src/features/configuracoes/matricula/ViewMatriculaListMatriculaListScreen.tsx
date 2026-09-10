import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewMatriculaListMatriculaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Matricula</h1><DataTable path="/api/view/matricula/listMatricula" createNavigateTo="/view/matricula/wizard"/></main>
    </PermissionGate>;
}
