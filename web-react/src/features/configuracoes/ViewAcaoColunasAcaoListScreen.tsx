import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewAcaoColunasAcaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Acao</h1><DataTable path="/api/view/acao/colunasAcao"/></main>
    </PermissionGate>
}