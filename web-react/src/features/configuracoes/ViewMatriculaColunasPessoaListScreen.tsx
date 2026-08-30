import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMatriculaColunasPessoaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Pessoa</h1><DataTable path="/api/view/matricula/colunasPessoa"/></main>
    </PermissionGate>
}
