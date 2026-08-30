import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCurriculoColunasRequisitoMatrizListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Requisito Matriz</h1><DataTable path="/api/view/curriculo/colunasRequisitoMatriz"/></main>
    </PermissionGate>
}
