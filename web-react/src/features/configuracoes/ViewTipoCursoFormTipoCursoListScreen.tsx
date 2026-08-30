import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoCursoFormTipoCursoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Curso</h1><DataTable path="/api/view/tipoCurso/formTipoCurso"/></main>
    </PermissionGate>
}
