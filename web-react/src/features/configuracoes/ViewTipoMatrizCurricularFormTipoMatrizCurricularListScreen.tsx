import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoMatrizCurricularFormTipoMatrizCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Matriz Curricular</h1><DataTable
            path="/api/view/tipoMatrizCurricular/formTipoMatrizCurricular"/></main>
    </PermissionGate>
}