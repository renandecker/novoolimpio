import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoMatrizCurricularListTipoMatrizCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Matriz Curricular</h1><DataTable path="/api/view/tipoMatrizCurricular/listTipoMatrizCurricular"/>
        </main>
    </PermissionGate>
}
