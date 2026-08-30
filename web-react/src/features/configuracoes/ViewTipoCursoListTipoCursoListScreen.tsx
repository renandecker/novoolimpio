import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoCursoListTipoCursoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Curso</h1><DataTable path="/api/view/tipoCurso/listTipoCurso"/></main>
    </PermissionGate>
}
