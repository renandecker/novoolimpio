import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCursoListCursoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Curso</h1><DataTable path="/api/view/curso/listCurso"/></main>
    </PermissionGate>
}
