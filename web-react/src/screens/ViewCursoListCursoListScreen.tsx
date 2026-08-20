import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCursoListCursoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Curso</h1><DataTable path="/api/view/curso/listCurso"/></main>
    </PermissionGate>
}