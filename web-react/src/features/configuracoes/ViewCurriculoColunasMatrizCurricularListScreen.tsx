import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCurriculoColunasMatrizCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Matriz Curricular</h1><DataTable path="/api/view/curriculo/colunasMatrizCurricular"/></main>
    </PermissionGate>
}
