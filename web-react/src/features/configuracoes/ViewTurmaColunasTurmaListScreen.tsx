import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTurmaColunasTurmaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Turma</h1><DataTable path="/api/view/turma/colunasTurma"/></main>
    </PermissionGate>
}
