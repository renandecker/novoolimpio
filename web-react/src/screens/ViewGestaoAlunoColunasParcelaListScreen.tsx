import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewGestaoAlunoColunasParcelaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Parcela</h1><DataTable path="/api/view/gestaoAluno/colunasParcela"/></main>
    </PermissionGate>
}