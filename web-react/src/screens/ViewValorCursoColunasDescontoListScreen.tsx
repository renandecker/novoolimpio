import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewValorCursoColunasDescontoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Desconto</h1><DataTable path="/api/view/valorCurso/colunasDesconto"/></main>
    </PermissionGate>
}