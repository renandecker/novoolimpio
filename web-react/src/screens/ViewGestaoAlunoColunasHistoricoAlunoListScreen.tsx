import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewGestaoAlunoColunasHistoricoAlunoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Historico Aluno</h1><DataTable path="/api/view/gestaoAluno/colunasHistoricoAluno"/></main>
    </PermissionGate>
}