import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewGestaoAlunoColunasParcelaAlterarListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Parcela Alterar</h1><DataTable path="/api/view/gestaoAluno/colunasParcelaAlterar"/></main>
    </PermissionGate>
}
