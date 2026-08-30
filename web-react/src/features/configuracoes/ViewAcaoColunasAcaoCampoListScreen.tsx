import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewAcaoColunasAcaoCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Acao Campo</h1><DataTable path="/api/view/acao/colunasAcaoCampo"/></main>
    </PermissionGate>
}
