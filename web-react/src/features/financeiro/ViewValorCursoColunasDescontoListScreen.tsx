import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewValorCursoColunasDescontoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Desconto</h1><DataTable path="/api/view/valorCurso/colunasDesconto"/></main>
    </PermissionGate>
}
