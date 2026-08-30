import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewGestaoAlunoListHistoricoAlunoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Historico Aluno</h1><DataTable path="/api/view/gestaoAluno/listHistoricoAluno"/></main>
    </PermissionGate>
}
